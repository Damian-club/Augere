import { environment } from "../config/environment";
import { ContactService } from "./contactService";
import { AuthService } from "./authService";

const API_URL = environment.api;

export const contactService = new ContactService(API_URL);
export const authService = new AuthService(API_URL);
