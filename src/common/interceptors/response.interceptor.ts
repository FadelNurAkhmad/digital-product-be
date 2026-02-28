/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { statusConstant } from 'src/constants/status.constant';

// Tipe Envelope untuk Standarisasi Respon API
type Envelope<T> = {
  status: 'success' | 'error';
  code: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
    nextPage: number | null;
    previousPage: number | null;
  };
};

// Fungsi untuk Mendapatkan Pesan Default Berdasarkan Kode Status HTTP
function defaultMessageByStatusCode(code: number): string {
  switch (code) {
    case 200:
      return 'OK';
    case 201:
      return 'Created';
    case 204:
      return 'No Content';
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 500:
      return 'Internal Server Error';
    default:
      return 'Response';
  }
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Envelope<T>> {
  constructor(private readonly reflector: Reflector) {}

  // Fungsi Rekursif untuk Mengubah Properti dari camelCase ke snake_case
  private camelToSnakeCase(obj: any, keyName?: string): any {
    if (obj instanceof Date) {
      // instanceof Date untuk Memastikan Objek Merupakan Tanggal, Kemudian Format Menjadi ISO String
      if (keyName && /_date$/.test(keyName)) {
        // Jika Nama Properti Berakhiran "_date", Hanya Ambil Bagian Tanggal (YYYY-MM-DD) dari ISO String
        return obj.toISOString().split('T')[0];
      }
      return obj.toISOString();
    }

    // Jika Objek Bukan Tipe Object atau Null, Kembalikan Nilai Asli (Tidak Diubah)
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    // Jika Objek Merupakan Array, Terapkan Fungsi camelToSnakeCase pada Setiap Elemen dalam Array
    if (Array.isArray(obj)) {
      return obj.map((item: any) => this.camelToSnakeCase(item));
    }

    // Jika Objek Merupakan Object Biasa, Ubah Setiap Properti dari camelCase ke snake_case dan Terapkan Fungsi camelToSnakeCase Secara Rekursif pada Nilai Properti Tersebut
    return Object.fromEntries(
      Object.entries(obj).map(
        ([key, value]: [string, unknown]): [string, any] => {
          const snakeKey: string = key.replace(
            /[A-Z]/g,
            (letter: string) => `_${letter.toLowerCase()}`,
          );
          return [snakeKey, this.camelToSnakeCase(value, snakeKey)];
        },
      ),
    );
  }

  // Fungsi Intercept untuk Memproses Respon API dan Mengubah Formatnya Menjadi Standar Envelope
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Envelope<T>> {
    const http = context.switchToHttp(); // Mengambil Objek HTTP dari Konteks Eksekusi
    const res = http.getResponse(); // Mengambil Objek Respon HTTP untuk Mengatur Kode Status dan Header

    // Mengambil Metadata Pesan Respon dan Opsi Respon dari Dekorator pada Handler atau Kelas
    const messageMeta = this.reflector.getAllAndOverride<string>(
      'RESPONSE_MESSAGE',
      [context.getHandler(), context.getClass()],
    );

    // Metadata Opsi Respon untuk Menentukan Kode Status Khusus atau Opsi Lainnya
    const optsMeta = this.reflector.getAllAndOverride<any>('RESPONSE_OPTS', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika Metadata Opsi Respon Menentukan Kode Status, Atur Kode Status pada Respon HTTP
    if (optsMeta?.code) {
      res.statusCode = optsMeta.code;
    }

    return next.handle().pipe(
      map((raw: any) => {
        const code = res.statusCode || 200; // Gunakan Kode Status dari Respon HTTP, atau Default ke 200 Jika Tidak Tersedia
        const message =
          optsMeta?.message ?? messageMeta ?? defaultMessageByStatusCode(code); // Tentukan Pesan Respon Berdasarkan Opsi, Metadata, atau Pesan Default Berdasarkan Kode Status

        // Penanganan Khusus untuk Respon dengan Format Pagination
        const isPagination =
          raw &&
          typeof raw === 'object' && // Memastikan Respon Merupakan Objek dan Memiliki Properti yang Diperlukan untuk Pagination
          Array.isArray(raw.data) && // Memastikan Properti 'data' Merupakan Array
          Number.isFinite(raw.count) && // Memastikan Properti 'count' Merupakan Angka yang Valid
          Number.isFinite(raw.pageSize) && // Memastikan Properti 'pageSize' Merupakan Angka yang Valid
          Number.isFinite(raw.page); // Memastikan Properti 'page' Merupakan Angka yang Valid

        // Jika Respon Memiliki Format Pagination, Ekstrak Data dan Informasi Pagination untuk Disertakan dalam Respon Standar
        if (isPagination) {
          const rows = raw.data;
          const total = Number(raw.count);
          const page = Number(raw.page);
          const limit = Number(raw.pageSize);
          const totalPage = limit > 0 ? Math.ceil(total / limit) : 0; // Hitung Total Halaman Berdasarkan Total Item dan Ukuran Halaman
          const nextPage = page < totalPage ? page + 1 : null; // Tentukan Halaman Berikutnya Jika Masih Ada Halaman Setelah Halaman Saat Ini
          const previousPage = page > 1 ? page - 1 : null; // Tentukan Halaman Sebelumnya Jika Masih Ada Halaman Sebelum Halaman Saat Ini

          return {
            code,
            status: statusConstant.SUCCESS,
            message,
            data: this.camelToSnakeCase(rows),
            meta: {
              total,
              page,
              limit,
              totalPage,
              nextPage,
              previousPage,
            },
          } as any;
        }

        // Penanganan Khusus untuk Auth Payload (access_token)
        const isAuthPayload: any =
          raw && typeof raw === 'object' && 'access_token' in raw; // Memastikan Respon Merupakan Objek dan Memiliki Properti 'access_token'

        if (optsMeta?.liftToken && isAuthPayload) {
          return {
            code,
            status: statusConstant.SUCCESS,
            message,
            data: this.camelToSnakeCase(raw),
            access_token: raw.access_token,
          } as any;
        }

        // Respons Standar (Non-Pagination / Non-LiftToken)
        return {
          code,
          status: statusConstant.SUCCESS,
          message,
          data: this.camelToSnakeCase(raw),
        } as any;
      }),
    );
  }
}
