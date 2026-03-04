/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class ApproveRejectResponse {
  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: any) => Number(o.status) === 300) // untuk status 300 (reject), note harus diisi
  note: string;

  @IsBoolean()
  @IsOptional()
  is_withdraw: boolean;

  @IsString()
  @ValidateIf((o: any) => o.is_withdraw) // jika is_withdraw true, proof_image_key harus diisi
  proof_image_key: string;
}
