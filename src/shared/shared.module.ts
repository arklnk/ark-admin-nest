import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './services/app-config.service';

const providers = [AppConfigService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}
