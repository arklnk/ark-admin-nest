import { MidwayDecoratorService } from '@midwayjs/core';
import { registerAdminUserDecorator } from './admin-user.decorator';

export function registerDecorator(service: MidwayDecoratorService) {
  registerAdminUserDecorator(service);
}
