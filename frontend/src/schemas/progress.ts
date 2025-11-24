export interface Progress {
  uuid: string;
  entry_uuid: string;
  student_uuid: string;
  finished: boolean;
}

export interface ProgressCreate {
  entry_uuid: string;
  student_uuid: string;
  finished: boolean;
}

export interface ProgressUpdate {
  entry_uuid?: string;
  student_uuid?: string;
  finished?: boolean;
}
