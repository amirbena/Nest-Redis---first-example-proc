import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import * as config from 'config';
@Injectable()
export class OrderService {
    private provider: Redis;
    private logger = new Logger("UserService");

    constructor(
        orderProvider: RedisService
    ) {
        const dbConfig = config.get("db");
        const name: string = dbConfig["name"];
        this.provider = orderProvider.getClient(name);
    }

}
