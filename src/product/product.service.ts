import { UpdateProductDto } from './dto/update-category-dto';
import { UpdateCategoryDto } from './../category/dto/category-update';
import { IDetailedProduct } from './product.detailed.interface';
import { RedisPromisfy } from './../redisPromise/redis-promisfy.promisfy';
import { CreateProductDto } from './dto/create-product-dto';
import { IProduct } from './product.interface';
import { CategoryService } from './../category/category.service';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';
import * as config from 'config';
import { v4 as uuid } from 'uuid';
import async from 'async';
import ICategory from 'src/category/category.interface';


@Injectable()
export class ProductService {
    private provider: Redis;
    private logger = new Logger("ProductSerivce");
    private categoryService: CategoryService;
    constructor(
        productProvider: RedisService,
        categoryService: CategoryService
    ) {
        const dbConfig = config.get("db");
        const name: string = dbConfig["name"];
        this.provider = productProvider.getClient(name);
        this.categoryService = categoryService;
    }
    private async isProductHasFoundIntoDB(productName: string, categoryId: string): Promise<boolean> {
        let isFound = false;
        const items = await RedisPromisfy.getItems(this.provider, "products");
        await async.each(items, async item => {
            const product: IProduct = JSON.parse(item);
            const { name, categoryId: itemCategory } = product;
            if (name === productName && categoryId === itemCategory) {
                isFound = true;
                return;
            }
        })
        return isFound;
    }
    private async destroyAllNotAssociatedProudcts(items = {}, keys = []): Promise<Record<string, string>> {
        if (!Object.keys(items).length) {
            const newItems = await RedisPromisfy.getItems(this.provider, "products");
            items = newItems;
            if (!keys.length) keys = Object.keys(newItems);
        }
        if (!keys.length) keys = Object.keys(items);
        const ids = [], categoryKeys = [];
        const deletedIds: string[] = this.categoryService.getDeletedIds();
        await async.each(keys, async key => {
            const product: IProduct = JSON.parse(items[key]);
            if (deletedIds.includes(product.categoryId)) {
                ids.push(key);
                categoryKeys.push(product.categoryId);
            }
        })
        if (!ids.length) return items;
        await RedisPromisfy.deleteItemsAccordingHashName(this.provider, "products", ids);
        const newItems = {};
        await async.each(keys, async key => {
            if (!categoryKeys.includes(key)) {
                newItems[key] = items[key];
            }
        })
        return newItems;
    }
    public async createProduct(createProductDto: CreateProductDto): Promise<IProduct | "Category isn't found into DB"
        | "Same product in same category" | "Amount of entered category is bigger than capcity amount"> {
        const { categoryName, priceForUnit, productName, amountToStoreInKg } = createProductDto;

        const categoryObj = await this.categoryService.getCategoryObjByName(categoryName);
        if (!categoryObj) { await this.destroyAllNotAssociatedProudcts(); return "Category isn't found into DB"; }

        const categoryId = Object.keys(categoryObj)[0];
        const { foundCategory } = categoryObj;



        const isFound = await this.isProductHasFoundIntoDB(productName, categoryId);
        if (isFound) return "Same product in same category";
        if (foundCategory.amountToStoreInKg < amountToStoreInKg) return "Amount of entered category is bigger than capcity amount"
        const id = uuid();
        const product: IProduct = {
            name: categoryName,
            priceForUnit,
            categoryId,
            amountToStore: amountToStoreInKg
        }
        const result = await RedisPromisfy.setOrInsertItemToDB(this.provider, "products", id, product);
        if (result) {
            foundCategory.amountToStoreInKg = foundCategory.amountToStoreInKg - amountToStoreInKg;
            await this.categoryService.updateCategory(categoryId, foundCategory);
            return product;
        }
    }

    public async getProducts(): Promise<Record<string, IProduct>[]> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "products");
        const products = [];
        await async.each(keys, async key => {
            const newItem: IProduct = JSON.parse(items[key]);
            products.push({
                [key]: newItem
            })
        })
        return products;
    }

    public async getDetailedProducts(): Promise<Record<string, IDetailedProduct>[]> {
        const object = await RedisPromisfy.getItemsAndKeys(this.provider, "products");
        const products = [];
        await async.each(object.keys, async key => {
            const product: IProduct = JSON.parse(object.items[key]);
            const category = await this.categoryService.getCategoryById(product.categoryId);
            if (!category) { object.items = await this.destroyAllNotAssociatedProudcts(); }
            const detailedProduct: IDetailedProduct = {
                categoryName: category.categoryName,
                name: product.name,
                amountToStore: product.amountToStore,
                priceForUnit: product.priceForUnit
            }
            products.push({
                [key]: detailedProduct
            })
        })
        return products;
    }

    public async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<string | boolean> {
        const exists = await RedisPromisfy.existsinHash(this.provider, "products", id);
        if (!exists) return "Can't update something that not exists";
        let textFailure = "";
        const itemsAndKeys = await RedisPromisfy.getItemsAndKeys(this.provider, "products")
        let status: boolean = false;
        await async.each(itemsAndKeys.keys, async key => {
            if (key === id) {
                let product: IProduct = JSON.parse(itemsAndKeys.items[key]);
                const category: ICategory = await this.categoryService.getCategoryById(product.categoryId);
                if (!category) {
                    itemsAndKeys.items = await this.destroyAllNotAssociatedProudcts(itemsAndKeys.items, itemsAndKeys.keys);
                    textFailure = "Category Is not Found"; return
                }
                const { amountToStoreInKg, priceForUnit, productName } = updateProductDto;
                if (amountToStoreInKg && amountToStoreInKg > product.amountToStore) { textFailure = "Can't update- change amount"; return; }
                else {
                    product.amountToStore = amountToStoreInKg;
                    category.amountToStoreInKg -= amountToStoreInKg;
                    await this.categoryService.updateCategory(product.categoryId, category);
                }
                if (priceForUnit) product.priceForUnit = priceForUnit;
                if (productName) product.name = productName;

                status = await RedisPromisfy.setOrInsertItemToDB(this.provider, "products", id, product);
                return
            }
        })
        return textFailure !== "" ? textFailure : status
    }


    public async deleteProductsByIds(ids: string[]) {
        let result = false;
        let statusFailure = "";
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "products");
        await async.each(ids, async id => {
            const index = keys.indexOf(id);
            if (index !== -1) {

            }
        })
        result = await RedisPromisfy.deleteItemsAccordingHashName(this.provider, "products", ids);
    }






}
