import { IsOptional, IsString } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  bank: string;

  @IsOptional()
  @IsString()
  bank_account_name: string;

  @IsOptional()
  @IsString()
  bank_account_number: string;
}
