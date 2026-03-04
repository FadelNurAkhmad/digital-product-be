/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { typeConstant } from '../constants/type.constant';
import { ProductDto } from './product.dto';

export class CreateProductDto extends ProductDto {
  @IsString()
  @IsNotEmpty() // Wajib diisi saat membuat produk baru
  image_key: string;

  @IsString()
  @IsNotEmpty()
  // Validasi ebook_link hanya berjalan jika tipe produk adalah EBOOK
  @ValidateIf((o) => o.type_code === typeConstant.EBOOK)
  ebook_link: string;
}
