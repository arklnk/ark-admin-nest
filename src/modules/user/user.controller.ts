import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  UserAvatarGenerateRespDto,
  UserInfoRespDto,
  UserLoginCaptchaReqDto,
  UserLoginCaptchaRespDto,
  UserLoginReqDto,
  UserLoginRespDto,
  UserPasswordUpdateReqDto,
  UserPermMenuRespDto,
  UserProfileInfoRespDto,
  UserProfileUpdateReqDto,
} from './user.dto';
import { UserService } from './user.service';
import { wrapResponse } from '/@/common/utils/swagger';
import { AllowAnonPermission } from '/@/decorators/allow-anon-permission.decorator';
import { AuthUser } from '/@/decorators/auth-user.decorator';
import { Ip, Uri } from '/@/decorators/http.decorator';
import { SkipAuth } from '/@/decorators/skip-auth.decorator';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('User - 用户账户')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('login/captcha')
  @SkipAuth()
  @ApiOkResponse({
    type: wrapResponse({
      type: UserLoginCaptchaRespDto,
    }),
  })
  async loginCaptcha(@Query() query: UserLoginCaptchaReqDto) {
    return await this.userService.createLoginCaptcha(query.width, query.height);
  }

  @Post('login')
  @SkipAuth()
  @ApiOkResponse({
    type: wrapResponse({
      type: UserLoginRespDto,
    }),
  })
  async login(
    @Body() body: UserLoginReqDto,
    @Ip() ip: string,
    @Uri() uri: string,
  ) {
    return await this.userService.createLoginToken(body, ip, uri);
  }

  @Get('permmenu')
  @AllowAnonPermission()
  @ApiSecurityAuth()
  @ApiOkResponse({
    type: wrapResponse({
      type: UserPermMenuRespDto,
    }),
  })
  async permmenu(@AuthUser('uid') uid: number) {
    return await this.userService.getUserPermMenu(uid);
  }

  @Post('logout')
  @ApiSecurityAuth()
  @AllowAnonPermission()
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async logout(@AuthUser('uid') uid: number) {
    await this.userService.userLogout(uid);
  }

  @Get('info')
  @AllowAnonPermission()
  @ApiSecurityAuth()
  @ApiOkResponse({
    type: wrapResponse({
      type: UserInfoRespDto,
    }),
  })
  async info(@AuthUser('uid') uid: number) {
    return await this.userService.getUserInfo(uid);
  }

  @Get('profile/info')
  @AllowAnonPermission()
  @ApiSecurityAuth()
  @ApiOkResponse({
    type: wrapResponse({
      type: UserProfileInfoRespDto,
    }),
  })
  async profileInfo(@AuthUser('uid') uid: number) {
    return await this.userService.getUserProfileInfo(uid);
  }

  @Post('profile/update')
  @ApiSecurityAuth()
  @AllowAnonPermission()
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async profileUpdate(
    @AuthUser('uid') uid: number,
    @Body() body: UserProfileUpdateReqDto,
  ) {
    await this.userService.updateUserProfileInfo(uid, body);
  }

  @Get('avatar/generate')
  @AllowAnonPermission()
  @ApiSecurityAuth()
  @ApiOkResponse({
    type: wrapResponse({
      type: UserAvatarGenerateRespDto,
    }),
  })
  async avatarGenerate() {
    return this.userService.generateAvatar();
  }

  @Post('password/update')
  @AllowAnonPermission()
  @ApiSecurityAuth()
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async passwordUpdate(
    @AuthUser('uid') uid: number,
    @Body() body: UserPasswordUpdateReqDto,
  ) {
    await this.userService.updateUserPassword(uid, body);
  }
}
