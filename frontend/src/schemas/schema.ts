export interface Entry {
  uuid?: string;
  name: string;
  body: string;
  context: string;
  entry_type: string;
  position: number;
  category_id?: string;
  category_uuid: string;
}

export interface Category {
  uuid?: string;
  schema_uuid?: string;
  name: string;
  position: number;
  entry_list: Entry[];
}

export interface Schema {
  uuid: string;
  course_uuid: string;
}

export interface FullSchema extends Schema {
  course_uuid: string;
  category_list: Category[];
}

export interface DeleteSchemaResponse {
  detail: string;
}
