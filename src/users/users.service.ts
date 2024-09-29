import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) { }

  async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const userExists = await this.findUserByEmail(userSignUpDto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    userSignUpDto.password = await hash(userSignUpDto.password, 10)
    let user = this.userRepository.create(userSignUpDto);
    // return 
    user = await this.userRepository.save(user);
    delete user.password;
    return user;
  }

  async signin(userSignInDto: UserSignInDto): Promise<UserEntity> {
    const user = await this.userRepository.createQueryBuilder('users').addSelect('users.password').where('users.email=:email', { email: userSignInDto.email }).getOne();
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    const matchPass = await compare(userSignInDto.password, user.password);
    if (!matchPass) {
      throw new BadRequestException('Invalid credentials');
    }
    delete user.password;
    return user;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    console.log(user);
    
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    console.log(updateUserDto);
    
    await this.userRepository.update(id, {
      roles: updateUserDto.roles  // or cast to the appropriate type
    });
  }

  async remove(id: number) {
    const user = await this.userRepository.createQueryBuilder().delete().from(UserEntity).where("id = :id",{id:id}).execute()
    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ email });
  }

  async accessToken(user: UserEntity): Promise<string> {
    return sign({
      id: user.id,
      email: user.email
    }, process.env.JWT_SECRET, {
      expiresIn: '4h'
    });
  }
}
