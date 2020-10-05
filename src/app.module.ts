import { Module } from '@nestjs/common';
import { RedisConfigOptions } from './config/redis.config'
import { RedisModule } from "nestjs-redis";
import { UserModule } from './user/user.module';

import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    RedisModule.register(RedisConfigOptions),
    UserModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    
  ],
})
export class AppModule { }
