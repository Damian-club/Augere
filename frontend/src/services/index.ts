import { environment } from "../config/environment";
import { ContactService } from "./ContactService";
import { AuthService } from "./AuthService";
import { CourseService } from "./CourseService";
import { StudentService } from "./StudentService";

const API_URL = environment.api;

export const contactService = new ContactService(API_URL);
export const authService = new AuthService(API_URL);
export const courseService = new CourseService(API_URL);
export const studentService = new StudentService(API_URL);
