import type { AiChat, AiChatCreate } from "../schemas/aiChat";

export class AiChatService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/ai_chat`;
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

  // Obtener todos los chats de un progress
  async getByProgress(progressUuid: string): Promise<AiChat[]> {
    const res = await fetch(`${this.baseUrl}/progress/${progressUuid}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResp<AiChat[]>(res);
  }

  // Enviar un prompt y recibir respuesta de IA
  async sendPrompt(
    progressUuid: string,
    prompt: string
  ): Promise<{ user: AiChat; ai: AiChat }> {
    const res = await fetch(`${this.baseUrl}/progress/${progressUuid}/prompt`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    return this.handleResp<{ user: AiChat; ai: AiChat }>(res);
  }

  // Crear un chat simple (sin respuesta automática de IA)
  async createSimple(
    progressUuid: string,
    data: { author: "user" | "ai"; content: string }
  ): Promise<AiChat> {
    const res = await fetch(`${this.baseUrl}/progress/${progressUuid}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResp<AiChat>(res);
  }

  // Eliminar un chat
  async delete(uuid: string): Promise<{ detail: string }> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResp<{ detail: string }>(res);
  }
}