import { Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken'
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserEntity;
        }
    }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(private readonly usersService: UsersService) { }
    async use(req: Request, res: Response, next: NextFunction) {
        console.log("Request HEreeeeeeeeeeeeeeeeeeeeee");

        // console.log(req);
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || isArray(authHeader) || !authHeader.startsWith('Bearer ')) {
            req.currentUser = null;
            next();

        } else {
            const token = authHeader.split(' ')[1];
            const { id } = <JWTPayload>verify(token, process.env.JWT_SECRET);
            console.log(`Decoded user ID from token: ${id}`);
            const currentUser = await this.usersService.findOne(+id)
            req.currentUser = currentUser;
            next();
        }
    }
}

interface JWTPayload {
    id: string;
}
