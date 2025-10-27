export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  created_at: Date;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
