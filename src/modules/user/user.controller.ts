import { Controller, Get, Query } from '@nestjs/common';
import { CreateLoginCaptchaDto } from './user.dto';
import { UserService } from './user.service';
import { SkipAuth } from '/@/decorators/skip-auth.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('login/captcha')
  @SkipAuth()
  async login(@Query() option: CreateLoginCaptchaDto) {
    return await this.userService.createLoginCaptcha(
      option.width,
      option.height,
    );
  }
}
