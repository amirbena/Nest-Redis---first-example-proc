export interface IUser {
    email: string;
    password: string;
    fullName: string;
    salt: string;
    isAdmin: boolean
    address: {
        building: number;
        city: string;
        street: string;
        postalCode: string;
    }
}