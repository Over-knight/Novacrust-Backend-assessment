import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferFundsDto {
  @IsString()
  @IsNotEmpty()
  senderWalletId: string;

  @IsString()
  @IsNotEmpty()
  receiverWalletId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
