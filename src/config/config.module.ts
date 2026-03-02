import { Module } from '@nestjs/common';
import environmentConfig from './environment.config';
import { ConfigModule as ConfigModuleAlias } from '@nestjs/config';

@Module({
  imports: [
    // Menginisialisasi ConfigModule bawaan NestJS
    ConfigModuleAlias.forRoot({
      // Membuat module ini tersedia di semua module tanpa perlu import ulang
      isGlobal: true,
      // Mendaftarkan fungsi loader dari environment.config.ts yang kita buat tadi
      load: [environmentConfig],
    }),
  ],
})
export class ConfigModule {}
