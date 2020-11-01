
import { UpdateUserDto } from './dto/user-upadte';
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
        : Promise<string> {
        const id = uuid();
        const { email, address, fullName } = createUserDto;
        const isAdmin = createUserDto.isAdmin === "true";
        let found = false;
        const items = await RedisPromisfy.getItems(this.provider, TABLE_NAMES.USERS);
        await async.each(items, async item => {
            const user: IUser = JSON.parse(item);
            if (user.email === email) { found = true; return; }
        })
        if (found) return "Email is exist for other user";
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(createUserDto.password, salt);
        const user: IUser = {
            email,
            address,
            fullName,
            salt,
            password,
            isAdmin
        }
        await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.USERS, id, user);
        return password;
    }

    public async getUserByEmail(email: string): Promise<IUser> {
        let foundUser: IUser = null;
        const items = await RedisPromisfy.getItems(this.provider, TABLE_NAMES.USERS);
        await async.each(items, async item => {
            const user: IUser = JSON.parse(item);
            if (user.email === email) {
                foundUser = user;
                return;
            }
        })
        return foundUser;
    }

    public async getAllUsers(): Promise<Record<string, IUser>[]> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.USERS);
        const users: Record<string, IUser>[] = await async.map(keys, async  key => {
            const user: IUser = JSON.parse(items[key]);
            return {
                [key]: user
            }
        })
        return users;
    }

    public async updateUserDetails(id: string, updateUserDto: UpdateUserDto): Promise<string | boolean> {
        const exists = await RedisPromisfy.existsinHash(this.provider, TABLE_NAMES.USERS, id);
        if (!exists) return "Can't update something that not exists";
        let textFailure = "";
        const { keys, items } = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.USERS)

        let status: boolean = false;
        await async.each(keys, async key => {
            if (key === id) {
                let user: IUser = JSON.parse(items[key]);
                for (let key in Object.keys(updateUserDto)) {
                    user[key] = updateUserDto[key];
                }
                status = await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.USERS, id, user);
                return
            }
        })
        return textFailure !== "" ? textFailure : status
    }
}
