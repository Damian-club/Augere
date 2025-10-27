import { environment } from "../config/environment";
import { ContactService } from "./ContactService";
import { AuthService } from "./AuthService";

const API_URL = environment.api;

export const contactService = new ContactService(API_URL);
export const authService = new AuthService(API_URL);
