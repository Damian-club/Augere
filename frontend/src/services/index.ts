import { environment } from "../config/environment";
import { ContactService } from "./contactService";
import { AuthService } from "./authService";
import { CourseService } from "./CourseService";
import { StudentService } from "./StudentService";
import { SchemaService } from "./SchemaService";
import { ProgressService } from "./ProgressService";
import { SchemaCategoryService } from "./SchemaCategoryService";
import { SchemaEntryService } from "./SchemaEntryService";
import { AiChatService } from "./AiChatService";
import { AssignmentDataService } from "./AssigmentDataService";

const API_URL = environment.api;

export const contactService = new ContactService(API_URL);
export const authService = new AuthService(API_URL);
export const courseService = new CourseService(API_URL);
export const studentService = new StudentService(API_URL);
export const schemaService = new SchemaService(API_URL);
export const progressService = new ProgressService(API_URL);
export const schemaCategoryService = new SchemaCategoryService(API_URL);
export const schemaEntryService = new SchemaEntryService(API_URL);
export const aiChatService = new AiChatService(API_URL);
export const assignmentDataService = new AssignmentDataService(API_URL);

