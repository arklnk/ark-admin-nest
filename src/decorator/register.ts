import { MidwayDecoratorService } from '@midwayjs/core';
import { registerAdminUserDecorator } from './admin-user.decorator';
import { registerIgnoreFormatDecorator } from './ignore-format.decorator';

export function registerDecorator(service: MidwayDecoratorService) {
  registerAdminUserDecorator(service);
  registerIgnoreFormatDecorator(service);
}
