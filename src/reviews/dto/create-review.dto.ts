import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty({message:'Product should not be empty'})
    @IsNumber({},{message:'Product should not be string'})
    productId: number;

    @IsNotEmpty({message:'Ratings should not be empty'})
    @IsNumber({},{message:'Ratings should not be string'})
    ratings: number;

    @IsNotEmpty({message:'Comment should not be empty'})
    @IsString({message:'Comment should be string '})
    comment: string;
}
