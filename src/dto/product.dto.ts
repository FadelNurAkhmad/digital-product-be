/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  ValidateIf,
  Matches,
  IsUrl,
} from 'class-validator';
import { typeConstant } from 'src/constants/type.constant';

/**
 * DTO untuk Sub-Materi E-Course
 */
export class ECourseSubMaterialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  video_url: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;
}

/**
 * DTO untuk Materi E-Course (Berisi daftar Sub-Materi)
 */
export class ECourseMaterialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // Memvalidasi setiap objek di dalam array
  @Type(() => ECourseSubMaterialDto) // Mengubah objek plain JS menjadi instance class DTO
  ecourse_sub_materials: ECourseSubMaterialDto[];

  /**ValidationPipe melihat dekorator @Type(() => ECourseSubMaterialDto).
   *Sistem kemudian melakukan "looping" pada setiap item di dalam array ecourse_sub_materials dan
   *mengubahnya dari objek JSON biasa menjadi instance resmi dari class ECourseSubMaterialDto.
   **/
}

/**
 * DTO Utama untuk Product
 */
export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number) // Memastikan input dikonversi menjadi tipe Number
  category_id: number;

  @IsString()
  @IsNotEmpty()
  type_code: string; // Kode tipe (misal: ECOURSE, EBOOK, WEBINAR)

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true }) // Setiap elemen dalam array harus berupa string
  learn_points: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  audiences: string[];

  // --- VALIDASI KONDISIONAL BERDASARKAN type_code ---

  // Jika type_code adalah ECOURSE, maka field ini wajib ada
  @ValidateIf((o) => o.type_code === typeConstant.ECOURSE)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ECourseMaterialDto)
  ecourse_materials: ECourseMaterialDto[];

  // Jika type_code adalah EBOOK, maka field ini wajib ada
  @ValidateIf((o) => o.type_code === typeConstant.EBOOK)
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  ebook_page_count: number;

  // Field-field berikut wajib jika type_code adalah WEBINAR
  @ValidateIf((o) => o.type_code === typeConstant.WEBINAR)
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  webinar_duration: number;

  @ValidateIf((o) => o.type_code === typeConstant.WEBINAR)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) // Validasi format jam (HH:mm)
  webinar_time: string;

  @ValidateIf((o) => o.type_code === typeConstant.WEBINAR)
  @IsNotEmpty()
  webinar_date: string;

  @ValidateIf((o) => o.type_code === typeConstant.WEBINAR)
  @IsNotEmpty()
  @IsUrl() // Memastikan input adalah format URL yang valid
  webinar_link: string;
}
