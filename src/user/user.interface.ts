
import { Role } from '../enums/enums';


export interface IUser {
    email: string;
    password: string;
    fullName: string;
    salt: string;
    role: Role;
    address: {
        building: number;
        city: string;
        street: string;
        postalCode: string;
    }
}

export interface IUserShow {
    email: string;
    fullName: string;
    address: {
        building: number;
        city: string;
        street: string;
        postalCode: string;
    }
}

export interface IUserAdminShow {
    email: string;
    fullName: string;
    role: string;
    address: {
        building: number;
        city: string;
        street: string;
        postalCode: string;
    }
}
