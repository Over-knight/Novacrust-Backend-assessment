# Novacrust-Backend-assessment



// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  // The path to your SQLite file
  url      = env("DATABASE_URL")
}

model Wallet {
  id           String @id @default(uuid())
  currency     String // e.g., "USD" - kept simple as per requirement
  // Use "Int" to store balance in cents (e.g., $10.99 stored as 1099)
  balance      Int    @default(0)

  // Relationships
  sentTransactions     Transaction[] @relation("Sender")
  receivedTransactions Transaction[] @relation("Receiver")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL // Useful for transfers out
  TRANSFER
}

model Transaction {
  id           String @id @default(uuid())
  // Use "Int" for the amount in cents
  amount       Int
  type         TransactionType
  status       String // e.g., "COMPLETED", "PENDING", "FAILED"
  description  String?

  // Sender Wallet (can be null for DEPOSITs)
  senderId     String?
  sender       Wallet? @relation("Sender", fields: [senderId], references: [id])

  // Receiver Wallet (can be null for WITHDRAWALs)
  receiverId   String?
  receiver     Wallet? @relation("Receiver", fields: [receiverId], references: [id])

  createdAt DateTime @default(now())
}




# 1. Run the migration and apply the schema to the database
npx prisma migrate dev --name init_wallet_schema

# Generate Prisma Client
npx prisma generate