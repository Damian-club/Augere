import type {
  RegisterData,
  LoginData,
  User,
  LoginResponse,
} from "../schemas/auth";

export class AuthService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/auth`;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al registrar usuario");
    }

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const result = (await response.json()) as LoginResponse;
    localStorage.setItem("token", result.token); // Guarda el token automáticamente
    return result;
  }

  logout() {
    localStorage.removeItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No hay token disponible");

    const response = await fetch(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el usuario actual");
    }

    return response.json();
  }
}
