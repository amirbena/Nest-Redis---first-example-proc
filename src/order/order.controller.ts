import { Controller, HttpCode, Logger, Post, UseGuards, UsePipes, ValidationPipe, HttpStatus, Body, Req } from '@nestjs/common';
import { Role } from 'src/enums/enums';
import { ConvertOrderPipe } from 'src/pipes/convert-order-pipe.pipe';
import { RolesAuthGuard } from '../guards/authGuard.guard';
import { CreateOrderDto } from './dto/create-order';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(new RolesAuthGuard(Role.USER))
export class OrderController {
    private logger: Logger = new Logger("OrdersController");
    constructor(
        private orderService: OrderService

    ) { }

    @Post()
    @UsePipes(ConvertOrderPipe, ValidationPipe)
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    @HttpCode(HttpStatus.CREATED)
    public async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Req() req: any

    ) {
        const { decodedHttp } = req;
        const res = await this.orderService.createOrder(createOrderDto, decodedHttp.email);
        return res;
    }
}
