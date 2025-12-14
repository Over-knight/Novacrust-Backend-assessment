import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  wallet: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('WalletService', () => {
  let service: WalletService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockPrismaService.wallet.findUnique.mockReset();
    mockPrismaService.wallet.update.mockReset();
    mockPrismaService.wallet.create.mockReset();
    mockPrismaService.transaction.create.mockReset();
    mockPrismaService.transaction.findMany.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const mockWallet = {
        id: '123',
        currency: 'USD',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.wallet.create.mockResolvedValue(mockWallet);

      const result = await service.createWallet({ currency: 'USD' });

      expect(result).toEqual(mockWallet);
      expect(mockPrismaService.wallet.create).toHaveBeenCalledWith({
        data: { currency: 'USD', balance: 0 },
      });
    });
  });

  describe('getWallet', () => {
    it('should return wallet if found', async () => {
      const mockWallet = {
        id: '123',
        currency: 'USD',
        balance: 10000,
        sentTransactions: [],
        receivedTransactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getWallet('123');

      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);

      await expect(service.getWallet('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fundWallet', () => {
    it('should fund wallet successfully', async () => {
      const mockWallet = { id: 'wallet1', balance: 10000 };
      const mockUpdatedWallet = { id: 'wallet1', balance: 20000 };
      const mockTransaction = {
        id: 'tx1',
        amount: 10000,
        type: 'DEPOSIT',
        status: 'COMPLETED',
      };

      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.wallet.update.mockResolvedValue(mockUpdatedWallet);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.fundWallet({
        walletId: 'wallet1',
        amount: 100.0,
      });

      expect(result.wallet.balance).toBe(20000);
      expect(result.transaction.type).toBe('DEPOSIT');
    });

    it('should throw NotFoundException if wallet does not exist', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);

      await expect(
        service.fundWallet({ walletId: 'invalid', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('transferFunds', () => {
    it('should throw error if balance is insufficient', async () => {
      // Mock sender with 50 cents, trying to send 100 cents
      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce({ id: 'sender', balance: 50 }) // Sender
        .mockResolvedValueOnce({ id: 'receiver', balance: 0 }); // Receiver

      await expect(
        service.transferFunds({
          senderWalletId: 'sender',
          receiverWalletId: 'receiver',
          amount: 1.0, // 100 cents
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if sender wallet not found', async () => {
      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce(null) // Sender not found
        .mockResolvedValueOnce({ id: 'receiver', balance: 0 });

      await expect(
        service.transferFunds({
          senderWalletId: 'invalid',
          receiverWalletId: 'receiver',
          amount: 50.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if receiver wallet not found', async () => {
      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce({ id: 'sender', balance: 10000 })
        .mockResolvedValueOnce(null); // Receiver not found

      await expect(
        service.transferFunds({
          senderWalletId: 'sender',
          receiverWalletId: 'invalid',
          amount: 50.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if sender and receiver are the same', async () => {
      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce({ id: 'same', balance: 10000 })
        .mockResolvedValueOnce({ id: 'same', balance: 10000 });

      await expect(
        service.transferFunds({
          senderWalletId: 'same',
          receiverWalletId: 'same',
          amount: 50.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transfer funds successfully', async () => {
      const mockSender = { id: 'sender', balance: 10000 };
      const mockReceiver = { id: 'receiver', balance: 5000 };
      const mockUpdatedSender = { id: 'sender', balance: 5000 };
      const mockUpdatedReceiver = { id: 'receiver', balance: 10000 };
      const mockTransaction = {
        id: 'tx1',
        amount: 5000,
        type: 'TRANSFER',
        status: 'COMPLETED',
      };

      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);

      mockPrismaService.wallet.update
        .mockResolvedValueOnce(mockUpdatedSender)
        .mockResolvedValueOnce(mockUpdatedReceiver);

      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.transferFunds({
        senderWalletId: 'sender',
        receiverWalletId: 'receiver',
        amount: 50.0,
      });

      expect(result.sender.balance).toBe(5000);
      expect(result.receiver.balance).toBe(10000);
      expect(result.transaction.type).toBe('TRANSFER');
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const mockWallet = {
        id: 'wallet1',
        currency: 'USD',
        balance: 10000,
      };

      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);

      const result = await service.getBalance('wallet1');

      expect(result.balance).toBe(100.0); // Converted from cents
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(null);

      await expect(service.getBalance('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history for wallet', async () => {
      const mockWallet = { id: 'wallet1' };
      const mockTransactions = [
        {
          id: 'tx1',
          amount: 10000,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.transaction.findMany.mockResolvedValueOnce(
        mockTransactions,
      );

      const result = await service.getTransactionHistory('wallet1');

      expect(result).toEqual(mockTransactions);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getTransactionHistory('invalid'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
