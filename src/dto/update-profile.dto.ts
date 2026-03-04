import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/) // Hanya huruf dan spasi yang diperbolehkan
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateCreatorProfileDto extends UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  identity_number: string;

  @IsOptional()
  @IsDateString({ strict: true }) // untuk memastikan format tanggal yang benar
  birth_date: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  job_id: number | null;

  @IsOptional()
  @IsString()
  address: string;
}
