import { Controller, Get } from '@midwayjs/decorator';
import { IgnoreAuth } from '../decorator/ignore-auth.decorator';
import { IgnoreFormat } from '../decorator/ignore-format.decorator';

@Controller('/')
export class HomeController {
  @Get('/')
  @IgnoreFormat()
  @IgnoreAuth()
  async home() {
    return 'Power by Ark Admin';
  }
}
