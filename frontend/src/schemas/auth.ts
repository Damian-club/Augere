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
  uuid: string;
  name: string;
  email: string;
  avatar_path?: string;
  creation_date: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export type UpdateUserData = Omit<Partial<RegisterData>, "password"> & {
  avatar_path?: string;
};
