/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionUtil {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Menjalankan serangkaian operasi database dalam satu transaksi.
   * @param callback Fungsi berisi logika database yang akan dieksekusi
   */
  public async executeTransaction(
    callback: (queryRunner: QueryRunner) => Promise<any>,
  ): Promise<any> {
    // Membuat instance queryRunner baru
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    // Membangun koneksi database dan memulai transaksi
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Menjalankan operasi database yang dikirim melalui callback
      const result: any = await callback(queryRunner);

      // Jika berhasil, simpan semua perubahan ke database secara permanen
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      // Jika terjadi kesalahan, batalkan semua perubahan yang sempat dilakukan
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Pastikan koneksi dilepaskan kembali ke pool setelah selesai (berhasil maupun gagal)
      await queryRunner.release();
    }
  }
}
