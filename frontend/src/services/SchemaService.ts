import type {
  Schema,
  FullSchema,
  DeleteSchemaResponse,
} from "../schemas/schema";

export class SchemaService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/schema`;
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

  // Crear un esquema vacío
  async createSchema(courseId: string): Promise<Schema> {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await this.handleResp(res);
    if (!res.ok) throw new Error(data?.detail || "Error al crear esquema");
    return data as Schema;
  }

  // Obtener un esquema simple por UUID
  async getSchema(uuid: string): Promise<Schema> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener esquema");
    return res.json() as Promise<Schema>;
  }

  // Eliminar esquema
  async deleteSchema(uuid: string): Promise<DeleteSchemaResponse> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    const data = await this.handleResp(res);
    if (!res.ok) throw new Error(data?.detail || "Error al eliminar esquema");
    return data as DeleteSchemaResponse;
  }

  // Obtener esquema completo
  async getFullSchema(uuid: string): Promise<FullSchema> {
    const res = await fetch(`${this.baseUrl}/full/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener esquema completo");
    return res.json() as Promise<FullSchema>;
  }

  // Crear esquema completo
  async createFullSchema(
    schemaUuid: string,
    data: {
      course_id: string;
      category_list: {
        name: string;
        position: number;
        entry_list: {
          name: string;
          body: string;
          context: string;
          entry_type: string;
          position: number;
        }[];
      }[];
    }
  ): Promise<FullSchema> {
    const res = await fetch(`${this.baseUrl}/full/${schemaUuid}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const responseData = await this.handleResp(res);
    if (!res.ok)
      throw new Error(
        responseData?.detail || "Error al crear esquema completo"
      );
    return responseData as FullSchema;
  }

}

