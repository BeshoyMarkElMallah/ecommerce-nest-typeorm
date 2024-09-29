import { Type } from "class-transformer";
import { CreateShippingDto } from "./create-shipping.dto";
import { ValidateNested } from "class-validator";
import { OrderedProducts } from "./order-products.dto";

export class CreateOrderDto {
    @Type(()=>CreateShippingDto)
    @ValidateNested()
    shippingAddress: CreateShippingDto;

    @Type(()=>OrderedProducts)
    @ValidateNested()
    orderedProducts: OrderedProducts[];
    
}
