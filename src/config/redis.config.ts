import { RedisModuleOptions } from "nestjs-redis";
import * as config from 'config';

const dbConfig = config.get("db")
export const RedisConfigOptions: RedisModuleOptions = {
    name: dbConfig["name"],
    host: dbConfig["host"],
    port: dbConfig["port"],
    db: dbConfig["db"],

}