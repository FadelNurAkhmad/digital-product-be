/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { MidtransDto } from '../dto/midtrans.dto';
import * as Client from 'midtrans-client';
import { getSecretValue } from '../config/environment.config';
import { generalConstant } from '../constants/general.constant';
import { IMidtransResponse } from '../interfaces/midtrans.interface';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MidtransClient {
  // Inject ConfigService untuk mengambil konfigurasi environment (API Key, dll)
  constructor(private readonly configService: ConfigService) {}

  /**
   * Fungsi untuk mengirim data transaksi ke Midtrans dan mendapatkan Token/Redirect URL
   * @param data Objek yang berisi detail transaksi, pelanggan, dan item
   */
  public async sendToMidtrans(
    data: MidtransDto,
  ): Promise<IMidtransResponse | any> {
    try {
      /**
       * 1. Inisialisasi Instance Snap
       * Mengatur kredensial yang dibutuhkan:
       * - isProduction: Menentukan apakah menggunakan Sandbox atau Production
       * - serverKey & clientKey: Kunci rahasia dari Dashboard Midtrans
       */
      const snap = new Client.Snap({
        isProduction: getSecretValue(this.configService)
          .midtrans_is_production as any,
        serverKey: getSecretValue(this.configService)
          .midtrans_server_key as any,
        clientKey: getSecretValue(this.configService)
          .midtrans_client_key as any,
      });

      /**
       * 2. Membuat Transaksi
       * Memanggil API Midtrans untuk mendaftarkan transaksi baru.
       * 'data' di sini harus sesuai dengan format MidtransDto.
       */
      const response: Client.SnapTransactionResponse =
        await snap.createTransaction(data);

      /**
       * 3. Validasi Response
       * Jika response kosong atau gagal, kembalikan pesan error standar aplikasi.
       */
      if (!response) {
        return {
          message: generalConstant.MIDTRANS_ERROR,
        };
      }

      /**
       * 4. Output Berhasil
       * Mengembalikan 'token' (untuk pop-up frontend)
       * dan 'redirect_url' (jika ingin diarahkan ke halaman pembayaran Midtrans).
       */
      return {
        token: response.token,
        redirect_url: response.redirect_url,
      };
    } catch (error) {
      return error;
    }
  }
}
