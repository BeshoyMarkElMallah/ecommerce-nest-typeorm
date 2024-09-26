import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty({message:'Title should not be blank'})
    @IsString({ message: 'Title should be string' })
    title: string;

    @IsNotEmpty({message:'Description should not be blank'})
    @IsString({ message: 'Description should be string' })
    description: string;
    
    @IsNotEmpty({message:'Price should not be blank'})
    @IsNumber({maxDecimalPlaces:2},{message:"Price should be a number"})
    @IsPositive({message:'Price should be positive'})
    price: number;

    
    @IsNotEmpty({message:'stock should not be blank'})
    @IsNumber({},{message:"stock should be a number"})
    @Min(0,{message:'stock can not be negative'})
    stock: number;

    @IsNotEmpty({message:'Images should not be blank'})
    @IsArray({message:'images should be in array format'})
    images: string[];

    @IsNotEmpty({message:'Category should not be blank'})
    @IsNumber({},{message:"category should be a number"})
    categoryId: number;
}
