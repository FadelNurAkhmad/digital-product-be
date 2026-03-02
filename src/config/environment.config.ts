/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IAWSEnvironment } from '../interfaces/aws.interface';
import { environmentConstant } from '../constants/environment.constant';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { AwsUtil } from 'src/utils/aws.utils';

// Variabel penampung sementara untuk nilai konfigurasi yang dimuat
let jsonValue: any = {};

/**
 * Default export fungsi async untuk memuat konfigurasi
 * Digunakan oleh ConfigModule.forRoot di NestJS
 * Kondisi: Jika aplikasi mendeteksi NODE_ENV bukan "LOCAL", ia akan melakukan request ke AWS Lambda. Jika "LOCAL", ia akan mencari file config.json di root project.
 */
export default async (): Promise<IAWSEnvironment> => {
  // Cek apakah lingkungan saat ini BUKAN local (misal: production/staging)
  if (process.env.NODE_ENV !== environmentConstant.env.LOCAL) {
    const ssm = new AwsUtil();
    // Mengambil data rahasia dari AWS Systems Manager (SSM) Parameter Store
    const result: IAWSEnvironment = await ssm.getParameterStoreValue();
    jsonValue = result;
    return result;
  } else {
    // Jika di lokal, baca dari file config.json secara sinkron
    const config: string = fs.readFileSync('config.json', { encoding: 'utf8' });
    const result: IAWSEnvironment = JSON.parse(config) as IAWSEnvironment;
    jsonValue = result;
    return result;
  }
};

/**
 * Fungsi utilitas untuk mengambil nilai dari ConfigService
 * dengan mapping otomatis berdasarkan tipe data asli
 */
export const getSecretValue = (
  configService: ConfigService,
): Partial<IAWSEnvironment> => {
  // Melakukan deep copy sederhana terhadap jsonValue
  const environments: any = JSON.parse(JSON.stringify(jsonValue));
  const result: Partial<IAWSEnvironment> = {};

  // Melakukan iterasi pada setiap key di environment dan memasukkannya ke object result
  Object.keys(environments).forEach((key: string) => {
    // Menentukan tipe data untuk memastikan casting yang benar
    const dataType:
      | 'string'
      | 'number'
      | 'bigint'
      | 'boolean'
      | 'symbol'
      | 'undefined'
      | 'object'
      | 'function' = typeof environments[key];

    // Mengambil nilai dari configService berdasarkan key dan tipe datanya
    result[key] = configService.get<typeof dataType>(key);
  });

  return result;
};
