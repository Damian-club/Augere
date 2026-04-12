export interface AssignmentData {
  uuid: string;
  progress_uuid: string;
  answer: string;
  feedback: string;
  success: boolean;
  creation_date: string;
}

export interface AssignmentDataCreate {
  progress_uuid: string;
  answer: string;
  feedback: string;
  success: boolean;
}

export interface AssignmentDataSimple {
  answer: string;
  feedback: string;
  success: boolean;
}

export interface AssignmentPrompt {
  prompt: string;
}

export class AssignmentDataService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/assignment_data`;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResp<T>(res: Response): Promise<T> {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.detail || "Error en la respuesta del servidor");
    }
    return data;
  }

  // Obtener todos los assignment data de un progress
  async getByProgress(progressUuid: string): Promise<AssignmentData[]> {
    const res = await fetch(`${this.baseUrl}/progress/${progressUuid}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResp<AssignmentData[]>(res);
  }

  // Enviar respuesta y recibir evaluación automática
  async submitAnswer(
    progressUuid: string,
    answer: string
  ): Promise<AssignmentData> {
    const res = await fetch(`${this.baseUrl}/progress/${progressUuid}/answer`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt: answer }),
    });
    return this.handleResp<AssignmentData>(res);
  }

  // Crear assignment data manualmente
  async create(data: AssignmentDataCreate): Promise<AssignmentData> {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResp<AssignmentData>(res);
  }

  // Crear assignment data simple
  async createSimple(
    progressUuid: string,
    data: AssignmentDataSimple
  ): Promise<AssignmentData> {
    const res = await fetch(`${this.baseUrl}/progress/${progressUuid}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResp<AssignmentData>(res);
  }

  // Obtener un assignment data específico
  async getById(uuid: string): Promise<AssignmentData> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResp<AssignmentData>(res);
  }

  // Eliminar assignment data
  async delete(uuid: string): Promise<{ detail: string }> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResp<{ detail: string }>(res);
  }
}
