export class StudentService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/student`;
  }

  // Obtener headers
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Inscribirse a un curso
  async joinCourse(invitationCode: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/join/${encodeURIComponent(
          invitationCode
        )}`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ invitation_code: invitationCode }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail ||
          errorData?.errors?.[0]?.msg ||
          "Error al unirse al curso.";
        throw new Error(message);
      }

      return await res.json();
    } catch (err) {
      console.error("Error en StudentService.joinCourse:", err);
      throw err;
    }
  }

  // Desincribirse de un curso
  async unenrollFromCourse(courseId: string): Promise<void> {
    // Obtener student_id
    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error("No hay sesión activa");
    }

    const user = JSON.parse(userData);
    const studentId = user.uuid;

    const res = await fetch(`${this.baseUrl}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify({
        student_id: studentId,
        course_id: courseId,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Error al desinscribirse del curso");
    }
  }
}
