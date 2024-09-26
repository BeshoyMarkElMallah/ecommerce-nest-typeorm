import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Title can not be null' })
    @IsString({ message: 'Title should be string' })
    title: string;

    @IsNotEmpty({ message: 'Title can not be null' })
    @IsString({ message: 'Title should be string' })
    description: string;
}
