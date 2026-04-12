export class SchemaCategoryService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/schema_category`;
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

  // Crear categoría
  async createCategory(schemaUuid: string, name: string, position: number) {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, position, schema_uuid: schemaUuid }),
    });
    const data = await this.handleResp(res);
    if (!res.ok) throw new Error(data?.detail || "Error al crear categoría");
    return data;
  }

  // Actualizar categoría
  async updateCategory(categoryUuid: string, name: string, position: number) {
    const res = await fetch(`${this.baseUrl}/${categoryUuid}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, position }),
    });
    const data = await this.handleResp(res);
    if (!res.ok)
      throw new Error(data?.detail || "Error al actualizar categoría");
    return data;
  }

  // Eliminar categoría
  async deleteCategory(categoryUuid: string) {
    const res = await fetch(`${this.baseUrl}/${categoryUuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    const data = await this.handleResp(res);
    if (!res.ok) throw new Error(data?.detail || "Error al eliminar categoría");
    return data;
  }
}
