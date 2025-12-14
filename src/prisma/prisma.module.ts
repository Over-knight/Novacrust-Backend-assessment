import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Make it available everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export so others can inject it
})
export class PrismaModule {}