import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class OrderedProducts{
    @IsNotEmpty({message:'Product cannot be empty'})
    id: number;
    
    @IsNumber({maxDecimalPlaces:2},{message:'Price should be a number & Max decimal 2'})
    @IsPositive({message:'Price should be positive'})
    product_unit_price: number;

    @IsNumber({},{message:'Quantity should be a number'})
    @IsPositive({message:'Quantity should be positive'})
    product_quantity: number;
   
}