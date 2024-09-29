import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { OrderStatus } from "../enums/order-status.enum";
import { UserEntity } from "src/users/entities/user.entity";
import { ShippingEntity } from "./shipping.entity";
import { OrdersProductsEntity } from "./orders-product.entity";

@Entity({ name: "orders" })
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    orderAt: Timestamp;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PROCESSING })
    status: string;

    @Column({ nullable: true })
    shippedAt: Date;

    @Column({ nullable: true })
    deliveredAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.ordersUpdateBy)
    updatedBy: UserEntity;

    @OneToOne(() => ShippingEntity, (shipping) => shipping.order)
    @JoinColumn()
    shippingAddress: ShippingEntity;

    @OneToMany(() => OrdersProductsEntity, (orderProd) => orderProd.order, { cascade: true })
    products: OrdersProductsEntity[];

    @ManyToOne(() => UserEntity, (user) => user.orders)
    user: UserEntity;
}
