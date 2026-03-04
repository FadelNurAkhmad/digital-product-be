import { IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @IsNotEmpty()
  total_amount: number;
}
