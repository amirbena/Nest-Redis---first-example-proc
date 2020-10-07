
import * as IORedis from 'ioredis';
import * as async from 'async';
export class RedisPromisfy {

    /**
     *  Equilents provider.exists
     */
    public static exists(provider: IORedis.Redis, keyName: string): Promise<boolean> {
        return new Promise<boolean>((res, rej) => {
            provider.exists(keyName, (err, reply) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(reply > 0)
                }
            })
        })

    }
    /**
     * Checking if keyName exists in hashName into general Redis DB
     * @param provider Represrents the provider of nestjsService- connection to currentDB
     * @param hashName Represents the collectionName into DB - is exists into DB;
     * @param keyName Represents the key to check if it exists into hash
     * @returns true- if keyName is exists, false- if not
     */
    public static existsinHash(provider: IORedis.Redis, hashName: IORedis.KeyType, keyName: string) {
        return new Promise<boolean>((resolve, rej) => {
            provider.hexists(hashName, keyName, (err, res) => {
                if (err) rej(err)
                resolve(res > 0);
            })
        })

    }
    /**
     * Inserts a new Item to DB, and returns 1 if action in succeed
     * @param provider Represrents the provider of nestjsService- connection to currentDB
     * @param hashName Represents the collectionName into DB - is exists into DB
     * @param key  Represents the inserted key of new json value 
     * @param value  Reperesents json value of InsertedValue
     * 
     * @returns if item has succeed to insert to the hashname
     */
    public static async insertToItemToDB(provider: IORedis.Redis, hashName: IORedis.KeyType, key: string, value: any) {
        const valueStringify = JSON.stringify(value);
        const result = await provider.hset(hashName, key, valueStringify)
        return result > 0;

    }

    public static async getItems(provider: IORedis.Redis, hashName: string) {
        const items = await provider.hgetall(hashName);
        return items;

    }

}