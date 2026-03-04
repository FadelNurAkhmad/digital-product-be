/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { typeConstant } from '../constants/type.constant';
import { ProductDto } from './product.dto';

export class UpdateProductDto extends ProductDto {
  @IsString()
  @IsOptional() // Opsional saat melakukan update
  image_key: string;

  @IsString()
  @IsOptional()
  // Tetap divalidasi berdasarkan tipe produk, tapi boleh tidak dikirim (IsOptional)
  @ValidateIf((o) => o.type_code === typeConstant.EBOOK)
  ebook_link: string;
}
