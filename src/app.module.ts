import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilModule } from './utils/util.module';
import { ConfigModule } from './config/config.module';
import { ClientModule } from './clients/client.module';

@Module({
  imports: [UtilModule, ConfigModule, ClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
