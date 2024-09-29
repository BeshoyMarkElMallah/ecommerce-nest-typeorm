import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrdersProductsEntity } from './entities/orders-product.entity';
import { ShippingEntity } from './entities/shipping.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrdersProductsEntity) private readonly orderProductsRepository: Repository<OrdersProductsEntity>,
    @InjectRepository(ShippingEntity) private readonly shippingRepository: Repository<ShippingEntity>,
    @Inject(forwardRef(()=>ProductsService)) private readonly productService: ProductsService,

  ) { }

  async create(createOrderDto: CreateOrderDto, currentUser: UserEntity) {
    const shippingEntity = new ShippingEntity();
    Object.assign(shippingEntity, createOrderDto.shippingAddress);

    //new
    const savedShippingEntity = await this.shippingRepository.save(shippingEntity);
    console.log("Shipping entity before saving:", savedShippingEntity);
    //


    const orderEntity = new OrderEntity();
    orderEntity.shippingAddress = shippingEntity;
    orderEntity.user = currentUser;


    console.log("Order entity before saving:", orderEntity);
    const orderTBl = await this.orderRepository.save(orderEntity);
    console.log("Saved order entity:", orderTBl);

    let opEntity: {
      order: OrderEntity,
      product: ProductEntity,
      product_quantity: number,
      product_unit_price: number
    }[] = [];


    for (let i = 0; i < createOrderDto.orderedProducts.length; i++) {
      opEntity.push({
        order: orderTBl,
        product: await this.productService.findOne(createOrderDto.orderedProducts[i].id),
        product_quantity: createOrderDto.orderedProducts[i].product_quantity,
        product_unit_price: createOrderDto.orderedProducts[i].product_unit_price
      });
    }

    console.log("orderssssssssss", opEntity);


    await this.orderProductsRepository.createQueryBuilder()
      .insert()
      .into(OrdersProductsEntity)
      .values(opEntity)
      .execute();

    return await this.findOne(orderTBl.id);
  }

  async findAll() {
    return await this.orderRepository.find({
      relations: {
        shippingAddress: true,
        products: {
          product: true
        },
        user: true,
      }
    });
  }

  async findOne(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        shippingAddress: true,
        products: {
          product: true
        },
        user: true,
      }
    });

    if (!order) {
      throw new NotFoundException("No order Found")
    }

    return order;
  }

  async findOneByProductId(id: number) {
    const op = await this.orderProductsRepository.findOne({
      relations: {
        product: true
      },
      where: {
        product: {
          id
        }
      }
    });

    return op;
  }

  async update(id: number, updateOrderStatusDto: UpdateOrderStatusDto, currentUser: UserEntity) {
    let order = await this.findOne(id);

    if ((order.status === OrderStatus.DELIVERED) || (order.status === OrderStatus.CANCELLED)) {
      throw new BadRequestException(`Order is already ${order.status}`);
    }
    if ((order.status === OrderStatus.PROCESSING) && (updateOrderStatusDto.status !== OrderStatus.SHIPPED)) {
      throw new BadRequestException(`Delivery before shipped !!!`);
    }
    if ((order.status === OrderStatus.SHIPPED) && (updateOrderStatusDto.status === OrderStatus.PROCESSING)) {
      throw new BadRequestException(`Shipped before processing !!!`);
    }

    if ((order.status === OrderStatus.SHIPPED) && (updateOrderStatusDto.status === OrderStatus.SHIPPED)) {
      return order;
    }
    if (updateOrderStatusDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();

    }
    if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }
    order.status = updateOrderStatusDto.status;
    order.updatedBy = currentUser;

    order = await this.orderRepository.save(order);
    if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      await this.stockUpdate(order, OrderStatus.DELIVERED);
    }
    return order;

  }
  async cancelled(id: number, currentUser: UserEntity) {
    let order = await this.findOne(id);
    if (order.status === OrderStatus.CANCELLED) return order;
    order.status = OrderStatus.CANCELLED;
    order.updatedBy = currentUser;
    order = await this.orderRepository.save(order);
    await this.stockUpdate(order, OrderStatus.CANCELLED);
    return order
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async stockUpdate(order: OrderEntity, status: string) {
    for (const op of order.products) {
      await this.productService.updateStock(op.product.id, op.product_quantity, status);
    }
  }
}
