import { TABLE_NAMES } from './../enums/enums';
import { UserService } from './../user/user.service';
import { IOrder } from './order.interface';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as config from 'config';
import { CreateOrderDto } from './dto/create-order';
import * as async from 'async';
import { v4 as uuid } from 'uuid';
import { ProductService } from 'src/product/product.service';
import { IUser } from 'src/user/user.interface';
import * as RedisPromisfy from '../redisPromise/redis-promisfy.promisfy';
@Injectable()
export class OrderService {
    private provider: Redis;
    private logger = new Logger("UserService");

    constructor(
        orderProvider: RedisService,
        private productService: ProductService,
        private userService: UserService
    ) {
        const dbConfig = config.get("db");
        const name: string = dbConfig["name"];
        this.provider = orderProvider.getClient(name);
    }


    public async createOrder(createOrderDto: CreateOrderDto, email: string):
        Promise<string> {
        const { totalPrice, dateOfSupply, isPaid, amounts } = createOrderDto;
        let ifNameInArrayNotFound = false;
        const id = uuid();
        await async.each(amounts, async amount => {
            try {
                const { productId } = amount;
                const product = await this.productService
                    .getProductById(productId);

            } catch (ex) {
                ifNameInArrayNotFound = true;
                return;
            }

        })
        if (ifNameInArrayNotFound)
            throw new NotFoundException("One Of Products not found");

        const userId = await this.userService.getUserIdByEmail(email);
        const orderToInsert: IOrder = {
            userId,
            amounts,
            dateOfSupply,
            isPaid,
            totalPrice
        }
        await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.ORDERS, id, orderToInsert);
        return "Order added successfully";
    }

}
