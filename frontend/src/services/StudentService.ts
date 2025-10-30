export class StudentService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/student`;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async joinCourse(invitationCode: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/join?invitation_code=${encodeURIComponent(
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
}
