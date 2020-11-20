import { IDetailedProduct } from 'src/product/product.detailed.interface';
import { IUser } from './../user/user.interface';
export interface IOrder {
    userId: string;
    amounts: {
        productId: string,
        amount: number
    }[];
    totalPrice: number;
    isPaid: boolean;
    dateOfSupply: Date,

}

export interface IDetailedOrder {
    user: IUser;
    amounts: {
        product: IDetailedProduct,
        amount: number
    }[];
    totalPrice: number;
    isPaid: boolean;
    dateofSupply: Date;
}