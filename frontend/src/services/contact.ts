import type {
  ContactData,
  Contact,
  ContactsResponse,
} from "../schemas/contact";

export class ContactService {
  private readonly baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = `${apiUrl}/contact`;
  }

  async sendContactMessage(data: ContactData): Promise<Contact> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al enviar el mensaje");
    }

    return response.json();
  }

  async getContacts(): Promise<ContactsResponse> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error("Error al obtener los contactos");
    }

    return response.json();
  }
}
