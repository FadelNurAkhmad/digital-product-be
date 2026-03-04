import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class ProductVoucherDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @IsString()
  @IsNotEmpty()
  end_date: string;

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;

  @IsArray()
  @IsNumber({}, { each: true }) // Ensure each element in the array is a number
  @ArrayNotEmpty()
  products: number[];
}

export class ValidateProductVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  product_id: string;
}
