export interface IUser {
    email: string;
    password: string;
    fullName: string;
    salt: string;
    address: {
        building: number;
        city: string;
        street: string;
        postalCode: string;
    }
}