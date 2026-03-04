import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsNumber,
} from 'class-validator';

export class BaseRegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/) // Berdasarkan pola regex di gambar register.dto.ts
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  photo?: string | null;
}

export class RegisterCreatorDto extends BaseRegisterDto {
  @IsNumber()
  @IsNotEmpty()
  job_id: number;
}

export class RegisterUserDto extends BaseRegisterDto {
  @IsNumber()
  @IsOptional()
  job_id: number;
}
