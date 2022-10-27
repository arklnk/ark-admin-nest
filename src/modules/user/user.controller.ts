import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  UserLoginCaptchaReqDto,
  UserLoginReqDto,
  UserPasswordUpdateReqDto,
  UserProfileUpdateReqDto,
} from './user.dto';
import { UserService } from './user.service';
import { AllowAnonPermission } from '/@/decorators/allow-anon-permission.decorator';
import { AuthUser } from '/@/decorators/auth-user.decorator';
import { Ip, Uri } from '/@/decorators/http.decorator';
import { SkipAuth } from '/@/decorators/skip-auth.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('login/captcha')
  @SkipAuth()
  async loginCaptcha(@Query() query: UserLoginCaptchaReqDto) {
    return await this.userService.createLoginCaptcha(query.width, query.height);
  }

  @Post('login')
  @SkipAuth()
  async login(
    @Body() body: UserLoginReqDto,
    @Ip() ip: string,
    @Uri() uri: string,
  ) {
    return await this.userService.createLoginToken(body, ip, uri);
  }

  @Get('permmenu')
  @AllowAnonPermission()
  async permmenu(@AuthUser('uid') uid: number) {
    return await this.userService.getUserPermMenu(uid);
  }

  @Post('logout')
  @AllowAnonPermission()
  async logout(@AuthUser('uid') uid: number) {
    await this.userService.userLogout(uid);
  }

  @Get('info')
  @AllowAnonPermission()
  async info(@AuthUser('uid') uid: number) {
    return await this.userService.getUserInfo(uid);
  }

  @Get('profile/info')
  @AllowAnonPermission()
  async profileInfo(@AuthUser('uid') uid: number) {
    return await this.userService.getUserProfileInfo(uid);
  }

  @Post('profile/update')
  @AllowAnonPermission()
  async profileUpdate(
    @AuthUser('uid') uid: number,
    @Body() body: UserProfileUpdateReqDto,
  ) {
    await this.userService.updateUserProfileInfo(uid, body);
  }

  @Get('avatar/generate')
  @AllowAnonPermission()
  async avatarGenerate() {
    return this.userService.generateAvatar();
  }

  @Post('password/update')
  @AllowAnonPermission()
  async passwordUpdate(
    @AuthUser('uid') uid: number,
    @Body() body: UserPasswordUpdateReqDto,
  ) {
    await this.userService.updateUserPassword(uid, body);
  }
}
