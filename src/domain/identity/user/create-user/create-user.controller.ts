import {
  Body, Controller, Post,
} from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { CreateUserDto } from './create-user.dto';
import { Public } from '@/domain/auth/public.decorator';

@Controller('/users')
export class CreateUserController {
  constructor(
    private readonly createUser: CreateUserService,
    private readonly createUserDto: CreateUserDto,
  ) { }

  @Post()
  @Public()
  handle(@Body() body: CreateUserDto) {
    const {
      password, email, cpf, birthDate, name, phone, socialName,
    } = body;

    return this.createUser.execute({
      password, email, cpf, birthDate, name, phone, socialName,
    });
  }
}
