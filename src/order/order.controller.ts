import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { Controller, HttpCode, Logger, Post, UseGuards, UsePipes, ValidationPipe, HttpStatus, Body, Req, SetMetadata, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/enums/enums';
import { ConvertOrderPipe } from 'src/pipes/convert-order-pipe.pipe';
import { RolesGuard } from 'src/guards/roles-guard.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(AuthGuard("jwt"))
export class OrderController {
    private logger: Logger = new Logger("OrdersController");
    constructor(
        private orderService: OrderService

    ) { }

    @Post()
    @UsePipes(ConvertOrderPipe, ValidationPipe)
    @Roles(Role.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    public async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Query("user") user: JwtPayload

    ) {
        const res = await this.orderService.createOrder(createOrderDto, user.email);
        return res;
    }
}
