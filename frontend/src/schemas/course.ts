export interface Course {
  uuid: string;
  title: string;
  description?: string;
  logo_path?: string;
  invitation_code?: string;
  tutor_id: string;
  tutor_name?: string;
  creation_date?: string;
}