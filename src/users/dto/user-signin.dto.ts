import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class UserSignInDto{    
    @IsNotEmpty({message:'Email can not be null'})
    @IsEmail({},{message:"Please Provide a valid email"})
    email: string;

    @IsNotEmpty({message:'Password can not be null'})
    @MinLength(5,{message:"Password minimum character should be 5"})

    password: string;

}