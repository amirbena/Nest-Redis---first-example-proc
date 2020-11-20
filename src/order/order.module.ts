import { Module } from '@nestjs/common';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [ProductModule, UserModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
