import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [PrismaModule, WalletModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
