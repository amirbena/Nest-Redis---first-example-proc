import { IUser } from './user.interface';
import { RedisPromisfy } from './../redisPromise/redis-promisfy.promisfy';
import { CreateUserDto } from './dto/create-user';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import * as async from "async";
import { Injectable, Logger } from '@nestjs/common';
import * as config from 'config';
import { v4 as uuid } from "uuid";
import * as bcrypt from 'bcrypt';
import { TABLE_NAMES } from 'src/tableNames/names.table';

@Injectable()
export class UserService {
    private provider: Redis;
    private logger = new Logger("UserService");

    constructor(
        userProvider: RedisService
    ) {
        const dbConfig = config.get("db");
        const name: string = dbConfig["name"];
        this.provider = userProvider.getClient(name);
    }

    public async createUser(createUserDto: CreateUserDto)
        : Promise<"Email is exist for other user" | boolean> {
        const id = uuid();
        const { email, address, fullName } = createUserDto;
        let found = false;
        const items = await RedisPromisfy.getItems(this.provider, TABLE_NAMES.USERS);
        await async.each(items, async item => {
            const user: IUser = JSON.parse(item);
            if (user.email === email) { found = true; return; }
        })
        if (!found) return "Email is exist for other user";
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(createUserDto.password, salt);
        const user: IUser = {
            email,
            address,
            fullName,
            salt,
            password
        }
        const res = await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.USERS, id, user);
        return res;
    }
}
