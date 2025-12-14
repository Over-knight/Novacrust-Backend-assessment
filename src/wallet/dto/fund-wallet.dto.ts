import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class FundWalletDto {
  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
