import type {
  Progress,
  ProgressCreate,
  ProgressUpdate,
} from "../schemas/progress";

export class ProgressService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/progress`;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Crear progreso
  async createProgress(data: ProgressCreate): Promise<Progress> {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || "Error al crear progreso");
    }

    return await res.json();
  }

  // Obtener progreso por UUID
  async getProgress(uuid: string): Promise<Progress> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || "Error al obtener progreso");
    }

    return await res.json();
  }

  // Actualizar progreso
  async updateProgress(uuid: string, data: ProgressUpdate): Promise<Progress> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || "Error al actualizar progreso");
    }

    return await res.json();
  }

  // Eliminar progreso
  async deleteProgress(uuid: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || "Error al eliminar progreso");
    }
  }
}
