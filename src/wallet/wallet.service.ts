import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

//create a new wallet
  async createWallet(createWalletDto: CreateWalletDto) {
    const { currency } = createWalletDto;

    const wallet = await this.prisma.wallet.create({
      data: {
        currency,
        balance: 0,
      },
    });

    return wallet;
  }

//Get wallet by ID
  async getWallet(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
      include: {
        sentTransactions: true,
        receivedTransactions: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    return wallet;
  }

//get all wallets
  async getAllWallets() {
    return this.prisma.wallet.findMany({
      include: {
        sentTransactions: true,
        receivedTransactions: true,
      },
    });
  }

//deposit
  async fundWallet(fundWalletDto: FundWalletDto) {
    const { walletId, amount } = fundWalletDto;

    // Convert amount to cents (integer)
    const amountInCents = Math.round(amount * 100);

    // Check if wallet exists
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    //transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: amountInCents,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: amountInCents,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: `Deposit of ${amount} to wallet`,
          receiverId: walletId,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

//transfer funds
  async transferFunds(transferFundsDto: TransferFundsDto) {
    const { senderWalletId, receiverWalletId, amount } = transferFundsDto;

    // Convert amount to integer
    const amountInCents = Math.round(amount * 100);

    // Check if sender and receiver are different
    if (senderWalletId === receiverWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    // Check if both wallets exist
    const [senderWallet, receiverWallet] = await Promise.all([
      this.prisma.wallet.findUnique({ where: { id: senderWalletId } }),
      this.prisma.wallet.findUnique({ where: { id: receiverWalletId } }),
    ]);

    if (!senderWallet) {
      throw new NotFoundException(`Sender wallet with ID ${senderWalletId} not found`);
    }

    if (!receiverWallet) {
      throw new NotFoundException(`Receiver wallet with ID ${receiverWalletId} not found`);
    }

    // Check if sender has sufficient balance
    if (senderWallet.balance < amountInCents) {
      throw new BadRequestException('Insufficient balance');
    }

    // Use a transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Deduct from sender
      const updatedSender = await tx.wallet.update({
        where: { id: senderWalletId },
        data: {
          balance: {
            decrement: amountInCents,
          },
        },
      });

      if (updatedSender.balance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      // Add to receiver
      const updatedReceiver = await tx.wallet.update({
        where: { id: receiverWalletId },
        data: {
          balance: {
            increment: amountInCents,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: amountInCents,
          type: 'TRANSFER',
          status: 'COMPLETED',
          description: `Transfer of ${amount} from ${senderWalletId} to ${receiverWalletId}`,
          senderId: senderWalletId,
          receiverId: receiverWalletId,
        },
      });

      return {
        sender: updatedSender,
        receiver: updatedReceiver,
        transaction,
      };
    });

    return result;
  }

//get wallet balance
  async getBalance(walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: {
        id: true,
        currency: true,
        balance: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return {
      ...wallet,
      // Convert balance from cents to currency units
      balance: wallet.balance / 100,
    };
  }

//get transaction history
  async getTransactionHistory(walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: walletId },
          { receiverId: walletId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            currency: true,
          },
        },
        receiver: {
          select: {
            id: true,
            currency: true,
          },
        },
      },
    });

    return transactions;
  }
}
