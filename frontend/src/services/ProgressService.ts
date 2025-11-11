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

  private async handleResp(res: Response) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  // Crear progreso
  async create(data: ProgressCreate): Promise<Progress> {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(responseData?.detail || "Error al crear progreso");
    return responseData as Progress;
  }

  // Obtener progreso por UUID
  async get(uuid: string): Promise<Progress> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      headers: this.getHeaders(),
    });

    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(responseData?.detail || "Error al obtener progreso");
    return responseData as Progress;
  }

  // Actualizar progreso
  async update(uuid: string, data: ProgressUpdate): Promise<Progress> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(responseData?.detail || "Error al actualizar progreso");
    return responseData as Progress;
  }

  // Eliminar progreso
  async delete(uuid: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const responseData = await this.handleResp(res);
      throw new Error(responseData?.detail || "Error al eliminar progreso");
    }
  }

  // listar progresos por estudiante
  async listByStudent(student_uuid: string): Promise<Progress[]> {
    const res = await fetch(`${this.baseUrl}/by_student/${student_uuid}`, {
      headers: this.getHeaders(),
    });
    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(responseData?.detail || "Error al obtener progresos");
    return responseData as Progress[];
  }
}
