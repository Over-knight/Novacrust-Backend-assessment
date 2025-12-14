# Wallet Service API

A NestJS-based wallet service that provides APIs for creating wallets, funding them, and transferring funds between wallets.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern ORM for database access
- **SQLite** - Lightweight database (easy setup)
- **class-validator** - Request validation

## Features

✅ Create wallets with currency support  
✅ Fund wallets (deposits)  
✅ Transfer funds between wallets  
✅ Fetch wallet details with transaction history  
✅ Balance validation and error handling  
✅ Transaction tracking (deposits and transfers)  
✅ Atomic operations with database transactions  

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/
│   └── filters/
│       └── http-exception.filter.ts  # Global exception handler
├── prisma/
│   ├── prisma.module.ts       # Database connection module
│   └── prisma.service.ts      # Prisma service
└── wallet/
    ├── dto/                   # Data Transfer Objects (Validation)
    │   ├── create-wallet.dto.ts
    │   ├── fund-wallet.dto.ts
    │   └── transfer-funds.dto.ts
    ├── entities/
    │   └── wallet.entity.ts   # Response entity
    ├── wallet.controller.ts   # API endpoints
    ├── wallet.module.ts       # Wallet feature module
    └── wallet.service.ts      # Business logic
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Over-knight/Novacrust-Backend-assessment.git
   cd Novacrust-Backend-assessment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   
   The `.env` file is already configured with SQLite:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3000
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Running the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Create Wallet
**POST** `/wallets`

Create a new wallet with a specified currency.

**Request Body:**
```json
{
  "currency": "USD"
}
```

**Response:**
```json
{
  "id": "uuid",
  "currency": "USD",
  "balance": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

---

### 2. Get All Wallets
**GET** `/wallets`

Retrieve all wallets with their transaction history.

**Response:**
```json
[
  {
    "id": "uuid",
    "currency": "USD",
    "balance": 10000,
    "sentTransactions": [...],
    "receivedTransactions": [...],
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T..."
  }
]
```

---

### 3. Get Wallet by ID
**GET** `/wallets/:id`

Retrieve a specific wallet with transaction history.

**Response:**
```json
{
  "id": "uuid",
  "currency": "USD",
  "balance": 10000,
  "sentTransactions": [...],
  "receivedTransactions": [...],
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

---

### 4. Get Wallet Balance
**GET** `/wallets/:id/balance`

Retrieve just the balance of a wallet.

**Response:**
```json
{
  "id": "uuid",
  "currency": "USD",
  "balance": 100.00
}
```

---

### 5. Get Transaction History
**GET** `/wallets/:id/transactions`

Retrieve all transactions for a specific wallet.

**Response:**
```json
[
  {
    "id": "uuid",
    "amount": 10000,
    "type": "DEPOSIT",
    "status": "COMPLETED",
    "description": "Deposit of 100 to wallet",
    "senderId": null,
    "receiverId": "uuid",
    "createdAt": "2025-12-14T...",
    "sender": null,
    "receiver": { "id": "uuid", "currency": "USD" }
  }
]
```

---

### 6. Fund Wallet
**POST** `/wallets/fund`

Add funds to a wallet (deposit).

**Request Body:**
```json
{
  "walletId": "uuid",
  "amount": 100.00
}
```

**Response:**
```json
{
  "wallet": {
    "id": "uuid",
    "currency": "USD",
    "balance": 10000,
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T..."
  },
  "transaction": {
    "id": "uuid",
    "amount": 10000,
    "type": "DEPOSIT",
    "status": "COMPLETED",
    "description": "Deposit of 100 to wallet",
    "senderId": null,
    "receiverId": "uuid",
    "createdAt": "2025-12-14T..."
  }
}
```

---

### 7. Transfer Funds
**POST** `/wallets/transfer`

Transfer funds from one wallet to another.

**Request Body:**
```json
{
  "senderWalletId": "uuid-sender",
  "receiverWalletId": "uuid-receiver",
  "amount": 50.00
}
```

**Response:**
```json
{
  "sender": {
    "id": "uuid-sender",
    "currency": "USD",
    "balance": 5000,
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T..."
  },
  "receiver": {
    "id": "uuid-receiver",
    "currency": "USD",
    "balance": 5000,
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T..."
  },
  "transaction": {
    "id": "uuid",
    "amount": 5000,
    "type": "TRANSFER",
    "status": "COMPLETED",
    "description": "Transfer of 50 from uuid-sender to uuid-receiver",
    "senderId": "uuid-sender",
    "receiverId": "uuid-receiver",
    "createdAt": "2025-12-14T..."
  }
}
```

---

## Error Handling

The API returns meaningful error responses:

### 404 Not Found
```json
{
  "statusCode": 404,
  "timestamp": "2025-12-14T...",
  "path": "/wallets/invalid-id",
  "message": "Wallet with ID invalid-id not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-14T...",
  "path": "/wallets/transfer",
  "message": "Insufficient balance"
}
```

### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "amount must be a positive number",
    "walletId should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## Design Decisions & Assumptions

### Currency Storage
- Amounts are stored in **cents (integers)** to avoid floating-point precision issues
- Example: $100.00 is stored as 10000 cents
- This ensures accurate financial calculations

### Transaction Types
- **DEPOSIT**: Funding a wallet (no sender)
- **TRANSFER**: Moving funds between wallets
- **WITHDRAWAL**: Reserved for future use (no receiver)

### Atomic Operations
- All balance-changing operations use database transactions
- Ensures data consistency even if operations fail mid-way

### Validation
- All inputs are validated using `class-validator`
- Negative amounts are rejected
- Wallet existence is verified before operations
- Insufficient balance checks prevent overdrafts

### Database Choice
- SQLite for simplicity and ease of setup
- Can easily be switched to PostgreSQL/MySQL for production

---


## Testing

To run tests (when implemented):
```bash
npm test
```

---

## Author

**Irabor Victor**

GitHub: [Over-knight/Novacrust-Backend-assessment](https://github.com/Over-knight/Novacrust-Backend-assessment)

---

## License

ISC
