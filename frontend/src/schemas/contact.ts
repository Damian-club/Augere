export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Contact extends ContactData {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContactsResponse {
  data: Contact[];
  page: number;
  size: number;
  total: number;
}
