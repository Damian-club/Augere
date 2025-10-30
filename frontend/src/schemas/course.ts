export interface Course {
  uuid: string;
  title: string;
  description?: string;
  logo_path?: string | null;
  invitation_code?: string | null;
  tutor_id?: string
}