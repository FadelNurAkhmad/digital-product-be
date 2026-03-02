import { Module } from '@nestjs/common';
import { PaginationUtil } from './pagination.utils';
import { AwsUtil } from './aws.utils';
import { TransactionUtil } from './transaction.utils';

@Module({
  // Mendaftarkan semua utility agar bisa digunakan secara internal di dalam module ini
  providers: [AwsUtil, PaginationUtil, TransactionUtil],
  // Mengekspor utility agar module lain yang mengimpor UtilModule bisa menggunakannya
  exports: [AwsUtil, PaginationUtil, TransactionUtil],
})
export class UtilModule {}
