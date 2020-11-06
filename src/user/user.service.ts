
import { UpdateUserDto } from './dto/user-upadte';
import { IUser, IUserShow, IUserAdminShow } from './user.interface';
import * as RedisPromisfy from './../redisPromise/redis-promisfy.promisfy';
import { CreateUserDto } from './dto/create-user';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import * as async from "async";
import { Injectable, Logger } from '@nestjs/common';
import * as config from 'config';
import { v4 as uuid } from "uuid";
import * as bcrypt from 'bcrypt';
import { Role, RoleString, TABLE_NAMES } from 'src/enums/enums';

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
            role: Role.USER
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

    public async getAllUsers(): Promise<Record<string, IUserShow>[]> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.USERS);

        
        const users: Record<string, IUser>[] = await async.map(keys, async key => {
            const user: IUser = JSON.parse(items[key]);
            
            const userShow: IUserShow = {
                address: user.address,
                email: user.email,
                fullName: user.fullName
            }
            return {
                [key]: userShow
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

    public async getAllUsersExceptCurrent(email: string): Promise<Record<string, IUserAdminShow>[]> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.USERS);
        const users: Record<string, IUserAdminShow>[] = [];
        this.logger.log(items);

        keys.forEach(key=>{
            const user: IUser = JSON.parse(items[key]);
            const userShow: IUserAdminShow = {
                address: user.address,
                email: user.email,
                fullName: user.fullName,
                role: RoleString[user.role]
            }
            if (user.email !== email) {
                users.push({
                    [key]: userShow
                })
            }
        })
        return users;
    }

    public async deleteUser(ids: string[]): Promise<boolean> {
        return await RedisPromisfy.deleteItemsAccordingHashName(this.provider, TABLE_NAMES.USERS, ids);
    }

    public async makeUserAsSuperAdmin(id: string): Promise<"User is not found" | boolean> {
        const userStr = await RedisPromisfy.getItemByKey(this.provider, TABLE_NAMES.USERS, id);
        const user: IUser = JSON.parse(userStr);
        if (!user) return "User is not found";
        user.role = Role.SUPER_ADMIN;
        return await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.USERS, id, user);
    }
}
