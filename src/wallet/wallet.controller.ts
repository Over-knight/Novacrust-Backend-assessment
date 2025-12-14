import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  //create a new wallet
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(createWalletDto);
  }

// get all wallets
  @Get()
  async getAllWallets() {
    return this.walletService.getAllWallets();
  }

//get wallets by ID
  @Get(':id')
  async getWallet(@Param('id') id: string) {
    return this.walletService.getWallet(id);
  }

//get wallet balance
  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

//transaction history
  @Get(':id/transactions')
  async getTransactionHistory(@Param('id') id: string) {
    return this.walletService.getTransactionHistory(id);
  }

//deposit
  @Post('fund')
  @HttpCode(HttpStatus.OK)
  async fundWallet(@Body() fundWalletDto: FundWalletDto) {
    return this.walletService.fundWallet(fundWalletDto);
  }

 //transfer funds
  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transferFunds(@Body() transferFundsDto: TransferFundsDto) {
    return this.walletService.transferFunds(transferFundsDto);
  }
}
