/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { IPagination } from '../interfaces/database.interface';

@Injectable()
export class PaginationUtil {
  /**
   * Fungsi untuk menghasilkan objek pagination yang lengkap.
   * @param params Data yang mengacu pada interface IPagination
   * @returns Objek terformat dengan informasi halaman tambahan
   */
  public generatePagination(params: IPagination): object {
    // 1. Menghitung total halaman menggunakan Math.ceil (pembulatan ke atas)
    // Contoh: 10 data dengan pageSize 3 akan menghasilkan 4 halaman
    const totalPage: number = Math.ceil(params.count / params.pageSize);

    // 2. Menentukan nomor halaman berikutnya (nextPage)
    // Jika halaman saat ini lebih kecil dari total halaman, tambah 1. Jika tidak, return null.
    const nextPage: number | null =
      params.page < totalPage ? params.page + 1 : null;

    // 3. Menentukan nomor halaman sebelumnya (previousPage)
    // Jika halaman saat ini lebih besar dari 1, kurangi 1. Jika tidak, return null.
    const previousPage: number | null =
      params.page > 1 ? params.page - 1 : null;

    // 4. Mengembalikan objek terstruktur untuk konsumsi API/Frontend
    return {
      rows: params.data, // Data utama (biasanya berupa array)
      totalData: params.count, // Total record yang ada di database
      page: params.page, // Halaman yang sedang diakses
      limit: params.pageSize, // Berapa banyak data yang ditampilkan per halaman
      totalPage, // Total ketersediaan halaman
      nextPage, // Link/nomor untuk halaman selanjutnya
      previousPage, // Link/nomor untuk halaman sebelumnya
    };
  }
}
