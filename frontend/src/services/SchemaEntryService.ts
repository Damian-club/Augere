export class SchemaEntryService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/schema_entry`;
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

  // Crear entrada
  async createEntry(data: {
    name: string;
    body: string;
    context: string;
    entry_type: string;
    position: number;
    category_uuid: string;
  }) {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(responseData?.detail || "Error al crear entrada");
    return responseData;
  }

  // Actualizar entrada
  async updateEntry(
    entryUuid: string,
    data: Partial<{
      name: string;
      body: string;
      context: string;
      entry_type: string;
      position: number;
      category_uuid: string;
    }>
  ) {
    const res = await fetch(`${this.baseUrl}/${entryUuid}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(responseData?.detail || "Error al actualizar entrada");
    return responseData;
  }

  // Eliminar entrada
  async deleteEntry(entryUuid: string) {
    const res = await fetch(`${this.baseUrl}/${entryUuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    const data = await this.handleResp(res);
    if (!res.ok) throw new Error(data?.detail || "Error al eliminar entrada");
    return data;
  }
}
