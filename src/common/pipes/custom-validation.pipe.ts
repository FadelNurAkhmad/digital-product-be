/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Type,
  ValidationError,
  UnprocessableEntityException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  // Fungsi Utama untuk Melakukan Validasi pada Data Masukan (Input) Berdasarkan DTO yang Didefinisikan
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (value === null) return value; // Jika Nilai Masukan Adalah Null, Kembalikan Nilai Tersebut Tanpa Melakukan Validasi

    if (!metatype || !this.toValidate(metatype)) return value; // Jika Tidak Ada Tipe Data yang Didefinisikan untuk Validasi atau Tipe Data Tersebut Merupakan Tipe Primitif, Kembalikan Nilai Masukan Tanpa Melakukan Validasi

    const object: any = plainToInstance(metatype, value);
    const errors: ValidationError[] = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
    });

    // Jika Ditemukan Error Validasi, Flatten Struktur Error yang Kompleks Menjadi Format yang Lebih Sederhana dan Lemparkan Exception dengan Informasi Error Tersebut
    if (errors.length > 0) {
      const flattened: { field: string; message: string }[] =
        this.flattenValidationErrors(errors);
      throw new UnprocessableEntityException({
        // Lemparkan Exception dengan Status HTTP 422 (Unprocessable Entity) dan Sertakan Informasi Error yang Telah Diratakan (Flattened)
        message: 'Unprocessable Entity',
        errors: flattened,
      });
    }

    return value;
  }

  // Fungsi untuk Menentukan Apakah Tipe Data Merupakan Tipe yang Perlu Divalidasi (Bukan Tipe Primitif Seperti String, Boolean, Number, Array, atau Object)
  private toValidate(metatype: Type<any>): boolean {
    const primitives: Function[] = [String, Boolean, Number, Array, Object];
    return !primitives.includes(metatype);
  }

  // Fungsi untuk Meratakan (Flatten) Struktur Error Validasi yang Kompleks Menjadi Format yang Lebih Sederhana dengan Properti 'field' dan 'message' untuk Setiap Error Validasi yang Ditemukan
  private flattenValidationErrors(
    errors: ValidationError[],
  ): { field: string; message: string }[] {
    const out: Array<{ field: string; message: string }> = [];

    // Fungsi Rekursif untuk Menelusuri Setiap Error Validasi dan Anak-anaknya (Jika Ada) untuk Mengumpulkan Informasi Field dan Pesan Error ke dalam Array 'out'
    const walk = (err: ValidationError): void => {
      if (err.constraints) {
        for (const key in err.constraints) {
          if (Object.prototype.hasOwnProperty.call(err.constraints, key)) {
            out.push({ field: err.property, message: err.constraints[key] });
          }
        }
      }

      // Jika Error Validasi Memiliki Anak-anak (Nested Validation Errors), Terapkan Fungsi 'walk' Secara Rekursif pada Setiap Anak untuk Mengumpulkan Informasi Error dari Semua Level Struktur Validasi
      if (err.children?.length) {
        err.children.forEach(walk);
      }
    };

    errors.forEach(walk);
    return out;
  }
}
