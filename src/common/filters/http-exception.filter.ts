/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp(); // untuk mendapatkan konteks HTTP
    const res = ctx.getResponse(); // untuk mendapatkan objek response
    const status = exception.getStatus(); // untuk mendapatkan status code dari exception
    const payload = exception.getResponse() as any; // untuk mendapatkan payload dari exception

    const message =
      typeof payload === 'string'
        ? payload // Mengecek apakah error-nya hanya teks biasa. Jika ya, ambil teks tersebut.
        : Array.isArray(payload?.message) // NestJS sering mengirim pesan validasi (dari class-validator) dalam bentuk Array. Jika ini array, ambil array-nya.
          ? payload.message
          : (payload?.message ?? exception.message); // Jika bukan string dan bukan array, cari properti .message di dalam objek. Jika tidak ada juga, ambil pesan default dari sistem.

    const errors = payload?.errors ?? payload?.error ?? null; // untuk mendapatkan errors dari payload, jika tidak ada, gunakan null

    res.status(status).json({
      status: 'error',
      code: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
      ...(errors ? { errors } : {}),
    });
  }
}
