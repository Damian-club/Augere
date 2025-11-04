import type { Course, DeleteCourseResponse } from "../schemas/course";

export class CourseService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/course`;
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

  async createCourse(data: {
    title: string;
    description?: string;
    logo_path?: string;
    invitation_code?: string;
  }): Promise<Course> {
    const res = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(
        (await this.handleResp(res)).detail || "Error al crear curso"
      );
    return res.json();
  }

  async updateCourse(data: {
    uuid: string;
    title?: string;
    description?: string;
    logo_path?: string;
    invitation_code?: string;
  }): Promise<Course> {
    const res = await fetch(`${this.baseUrl}/${data.uuid}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(
        (await this.handleResp(res)).detail || "Error al actualizar curso"
      );
    return res.json();
  }

  async getCourse(uuid: string): Promise<Course> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Curso no encontrado");
    return res.json();
  }

  async deleteCourse(uuid: string): Promise<DeleteCourseResponse> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    const data = await this.handleResp(res);
    if (!res.ok) throw new Error(data?.detail || "Error al eliminar curso");
    return data as DeleteCourseResponse;
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const res = await fetch(`${this.baseUrl}/enrolled-courses`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener cursos inscritos");
    return res.json();
  }

  async getCreatedCourses(): Promise<Course[]> {
    const res = await fetch(`${this.baseUrl}/tutored-courses`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener cursos creados");
    return res.json();
  }

  async getCourseWithTutor(uuid: string): Promise<Course> {
    const res = await fetch(`${this.baseUrl}/summary/private/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener detalles del curso");
    return res.json();
  }

  // Obtener resumen privado de un curso:
  async getPrivateSummary(uuid: string): Promise<Course> {
    const res = await fetch(`${this.baseUrl}/summary/private/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener resumen privado del curso");
    return res.json();
  }

  // Obtener resumen general de los cursos de un usaurio:
  async getOverview(): Promise<{
    completion_percentage: number;
    completed_count: number;
    total_count: number;
    course_list: { name: string; completion_percentage: number }[];
  }> {
    const res = await fetch(`${this.baseUrl}/overview`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener resumen general");
    return res.json();
  }

  // Obtener excel
  async downloadExcel(uuid: string, name: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/excel/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener el excel");

    const blob = await res.blob();
    let a = document.createElement("a");
    let blobURL = window.URL.createObjectURL(blob);
    a.href = blobURL;
    a.download = `${name}.xlsx`.replace(" ", "_");
    document.body.append(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(blobURL);
  }

  // Obtener CSV
  async downloadCSV(uuid: string, name: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/csv/${uuid}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener el CSV");

    const blob = await res.blob();
    let a = document.createElement("a");
    let blobURL = window.URL.createObjectURL(blob);
    a.href = blobURL;
    a.download = `${name}.csv`.replace(" ", "_");
    document.body.append(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(blobURL);
  }
}
