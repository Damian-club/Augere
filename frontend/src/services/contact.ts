// import type { Contact, ContactData } from "../types/contact";
// import { environment } from "../config/environment";

// const API_URL = `${environment.api}/contact`;

// export async function sendContactMessage(data: ContactData): Promise<Contact> {
//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       throw new Error("Error al enviar el mensaje");
//     }

//     return await response.json();
//   } catch (error) {
//     console.log("Error en sendContactMessage: ", error);
//     throw error;
//   }
// }

import type { ContactData, Contact, ContactsResponse } from "../schemas/contact";
import { environment } from "../config/environment";

const API_URL = `${environment.api}/contact`;

// enviar
export async function sendContactMessage(data: ContactData): Promise<Contact> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Error al enviar el mensaje");

  return response.json();
}

// obtener
export async function getContacts(): Promise<ContactsResponse> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los contactos");
  return response.json();
}
