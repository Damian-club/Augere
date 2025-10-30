import type {
  RegisterData,
  LoginData,
  User,
  LoginResponse,
  UpdateUserData,
} from "../schemas/auth";

export class AuthService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/auth`;
  }
  // REGISTRAR
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Error al registrar usuario");
    }

    localStorage.setItem("token", result.access_token);

    return result;
  }
  // LOGIN
  async login(data: LoginData): Promise<LoginResponse> {
    console.log("🔑 Iniciando login...");

    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("📡 Login response status:", response.status);

    const result = await response.json();
    console.log("📡 Login response data:", result);

    if (!response.ok) {
      console.error("❌ Error en login:", result.detail);
      throw new Error(result.detail || "Credenciales incorrectas");
    }

    if (!result.access_token) {
      console.error("❌ No se recibió token en la respuesta");
      throw new Error("No se recibió token de autenticación");
    }

    console.log("✅ Token recibido, guardando...");
    localStorage.setItem("token", result.access_token);

    return result;
  }

  logout() {
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // No redirigir aquí para evitar loops
  }
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    console.log(
      "🔑 Token en getCurrentUser:",
      token ? `Bearer ${token.substring(0, 20)}...` : "NULL"
    );

    if (!token) {
      console.error("❌ No hay token disponible para getCurrentUser");
      throw new Error("No hay token disponible");
    }

    if (token.length < 20) {
      console.error("❌ Token parece inválido (muy corto)");
      this.logout();
      throw new Error("Token inválido");
    }

    try {
      console.log("🌐 Haciendo request a /auth/me...");
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 /auth/me response status:", response.status);
      console.log(
        "📡 /auth/me response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        // Si es error 401, el token es inválido
        if (response.status === 401) {
          console.error("❌ Token inválido, limpiando...");
          this.logout();
          throw new Error("Sesión expirada");
        }

        const errorText = await response.text();
        console.error("❌ Error en /auth/me:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Usuario obtenido:", result);

      localStorage.setItem("user", JSON.stringify(result));
      return result;
    } catch (error) {
      console.error("❌ Error en getCurrentUser:", error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error("No hay token disponible");

    const response = await fetch(`${this.baseUrl}/delete`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al eliminar cuenta: ${text}`);
    }

    // Limpia sesión local
    this.logout();
  }

  getUser() {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  async updateUser(data: UpdateUserData): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No hay token disponible");

    const response = await fetch(`${this.baseUrl}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Error al actualizar usuario");
    }

    localStorage.setItem("user", JSON.stringify(result));
    return result;
  }
}
