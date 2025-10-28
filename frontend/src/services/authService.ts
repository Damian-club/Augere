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
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Credenciales incorrectas");
    }

    localStorage.setItem("token", result.access_token);
    return result;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No hay token disponible");

    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Error al obtener el usuario actual");
    }

    localStorage.setItem("user", JSON.stringify(result));
    return result;
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
