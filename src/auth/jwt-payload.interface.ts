import { Role } from "../enums/enums";

export class JwtPayload {
    email: string;
    password: string;
    role: Role;
}