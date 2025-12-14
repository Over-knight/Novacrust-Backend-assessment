import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class TransferFundsDto {
  @IsString()
  @IsNotEmpty()
  senderWalletId: string;

  @IsString()
  @IsNotEmpty()
  receiverWalletId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
