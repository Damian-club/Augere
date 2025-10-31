export interface Entry {
  uuid?: string;
  name: string;
  body: string;
  context: string;
  entry_type: string;
  position: number;
  category_id?: string;
}

export interface Category {
  uuid?: string;
  schema_id?: string; 
  name: string;
  position: number;
  entry_list: Entry[];
}

export interface Schema {
  uuid: string;
  course_id: string;
}

export interface FullSchema extends Schema {
  category_list: Category[];
}

export interface DeleteSchemaResponse {
  detail: string;
}
