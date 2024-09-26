// import { PartialType } from '@nestjs/mapped-types';
// import { CreateUserDto } from './create-user.dto';
// import { UserSignInDto } from './user-signin.dto';

import { Roles } from "src/utility/common/user-roles.enum";

export class UpdateUserDto  {
    id: number;
    roles: Roles[];
}
