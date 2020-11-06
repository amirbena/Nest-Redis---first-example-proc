import { Logger } from '@nestjs/common';

import * as IORedis from 'ioredis';
import { resolveSoa } from 'dns';


const logger = new Logger("RedisPromisfy");
/**
     *  Equilents provider.exists
*/
export const exists = async (provider: IORedis.Redis, keyName: string): Promise<boolean> => {
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
export const existsinHash = async (provider: IORedis.Redis, hashName: IORedis.KeyType, keyName: string) => {
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
export const setOrInsertItemToDB = async (provider: IORedis.Redis, hashName: IORedis.KeyType, key: string, value: any) => {
    const valueStringify = JSON.stringify(value);
    const result = await provider.hset(hashName, key, valueStringify)
    return result > 0;

}

/**
  * 
  * @param provider  Represrents the provider of nestjsService- connection to currentDB
  * @param hashName   Represents the collectionName into DB - is exists into DB
  * 
  * @returns Items JSON according hash name: keys represents the key of array, value is stringified object
  */
export const getItems = async (provider: IORedis.Redis, hashName: string): Promise<Record<string, string>> => {
    const items = await provider.hgetall(hashName);
    return items;

}

/**
   * 
   * @param provider  Represrents the provider of nestjsService- connection to currentDB
   * @param hashName   Represents the collectionName into DB - is exists into DB 
   * 
   * @returns Object that contains 2 elements: Items JSON according hash name: keys represents the key of array, value is stringified object and
   * keys array of objects 
   *          
   */
export const getItemsAndKeys = async (provider: IORedis.Redis, hashName: string)
    : Promise<{ items: Record<string, string>, keys: string[] }> => {
    const items = await provider.hgetall(hashName);
    const keys = Object.keys(items);
    return {
        items,
        keys
    }

}

/**
    * Deletes Keys Array from table into DB
    * @param provider Represrents the provider of nestjsService- connection to currentDB
    * @param hashName Represents the collectionName into DB - is exists into DB 
    * @param keysToDelete Represents keys to delete in string array
    */
export const deleteItemsAccordingHashName = async (provider: IORedis.Redis, hashName: string, keysToDelete: string[]):
    Promise<boolean> => {


    const items = await provider.hdel(hashName, keysToDelete);
    return items === keysToDelete.length;

}




/**
 * Gets Item string by HashName& key
 * @param provider Represrents the provider of nestjsService- connection to currentDB
 * @param hashName Represents the collectionName into DB - is exists into DB  
 * @param keyName Represenets Key name of getItem
 * 
 * @returns String describes the object
 */
export const getItemByKey = async (provider: IORedis.Redis, hashName: string, keyName: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        provider.hget(hashName, keyName, (err, res) => {
            if (err) reject(err);
            resolve(res);
        })
    })
}




