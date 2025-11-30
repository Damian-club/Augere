import type { Student } from "../schemas/student";

export class StudentService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/student`;
  }

  // Headers con token
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /** Obtener información de un estudiante por UUID */
  async getByUuid(uuid: string): Promise<Student> {
    const res = await fetch(`${this.baseUrl}/${uuid}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Error al obtener estudiante");
    }

    return res.json();
  }

  /** Inscribir manualmente un estudiante en un curso */
  async enroll(student_uuid: string, course_uuid: string): Promise<Student> {
    const res = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ student_uuid, course_uuid }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Error al inscribir estudiante");
    }

    return res.json();
  }

  /** Unirse mediante código de invitación */
  async joinCourse(invitationCode: string): Promise<Student> {
    const res = await fetch(
      `${this.baseUrl}/join/${encodeURIComponent(invitationCode)}`,
      {
        method: "POST",
        headers: this.getHeaders(),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Error al unirse al curso");
    }

    return res.json();
  }

  /** Eliminar estudiante de un curso */
  async remove(user_uuid: string, course_uuid: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${user_uuid}/${course_uuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Error al eliminar estudiante");
    }
  }

  // Desinscribirse de un curso
  async unenrollFromCourse(courseUuid: string): Promise<void> {
    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error("No hay sesión activa");
    }

    const user = JSON.parse(userData);
    const userUuid = user.uuid;

    const res = await fetch(`${this.baseUrl}/${userUuid}/${courseUuid}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.detail || "Error al desinscribirse del curso");
    }
  }

  /** Obtener todos los estudiantes inscritos a un curso */
  async getByCourse(course_uuid: string): Promise<Student[]> {
    const res = await fetch(`${this.baseUrl}/by-course/${course_uuid}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Error al obtener estudiantes del curso");
    }

    return res.json();
  }
}
