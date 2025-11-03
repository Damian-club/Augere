import type { User } from "./auth";

export interface StudentProgress {
  entry_uuid: string;
  finished: boolean;
}

export interface StudentSummary {
  uuid: string;
  name: string;
  completion_percentage: number;
  progress_list: StudentProgress[];
}

export interface Course {
  uuid: string;
  title: string;
  description?: string;
  logo_path?: string;
  invitation_code?: string;
  tutor?: User;
  creation_date?: string;
  completion_percentage?: number;
  student_list?: StudentSummary[];
  student_count?: number;
}

export interface DeleteCourseResponse {
  detail: string;
}
