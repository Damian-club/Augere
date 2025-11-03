import type { User } from "./auth";

export interface Course {
  uuid: string;
  title: string;
  description?: string;
  logo_path?: string;
  invitation_code?: string;
  tutor: User;
  creation_date?: string;
}

export interface DeleteCourseResponse {
  detail: string;
}
