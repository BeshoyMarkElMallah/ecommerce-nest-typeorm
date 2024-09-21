import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSignInDto } from './dto/user-signin.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  async signup(@Body() body: UserSignUpDto): Promise<{ user: UserEntity }> {
    console.log(body);
    return { user: await this.usersService.signup(body) };
  }

  @Post('signin')
  async signin(@Body() UserSignInDto: UserSignInDto)
    : Promise<{
      token: string;
      user: UserEntity;
    }> {
    console.log(UserSignInDto);
    const user = await this.usersService.signin(UserSignInDto);
    const token = await this.usersService.accessToken(user);
    return { token, user }
  }


  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // return this.usersService.create(createUserDto);
    return 'Hi';
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string):Promise<UserEntity> {
    return await this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
