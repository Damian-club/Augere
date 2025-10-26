import { environment } from "../config/environment";
import { ContactService } from "./contact";

export const contactService = new ContactService(environment.api);
