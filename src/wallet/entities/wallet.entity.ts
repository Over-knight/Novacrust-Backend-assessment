export class WalletEntity {
  id: string;
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<WalletEntity>) {
    Object.assign(this, partial);
  }
}
