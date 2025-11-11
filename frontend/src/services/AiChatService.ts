export class AiChatService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/ai_chat/progress`;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResp(res: Response) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.detail || "Error en la respuesta del servidor");
    }
    return data;
  }

  async sendPrompt(progressUuid: string, prompt: string) {
    const res = await fetch(`${this.baseUrl}/${progressUuid}/prompt`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    return this.handleResp(res);
  }
}
