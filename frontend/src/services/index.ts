import { environment } from "../config/environment";
import { ContactService } from "./contactService";

export const contactService = new ContactService(environment.api);
