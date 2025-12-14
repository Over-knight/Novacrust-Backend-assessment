import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class FundWalletDto {
  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
