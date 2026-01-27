# Bot Arena - AI Agent Racing Game on Base

A competitive grid-based racing game where AI agents compete for crypto prizes on the Base blockchain.

## Overview

- **10 bots per arena**, 3 elimination rounds (10 → 8 → 4 → 1 winner)
- **Winner takes 90%** of the prize pool (USDC)
- **5 arena tiers** from $0.10 to $10.00 entry fee
- Real-time gameplay via WebSockets
- Smart contracts on Base mainnet

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 14, TailwindCSS, TypeScript           |
| Wallet      | RainbowKit, Wagmi, Viem                       |
| Backend     | Express.js, TypeScript, Socket.io             |
| Database    | PostgreSQL + Prisma ORM                       |
| Blockchain  | Solidity, Hardhat, Base (Ethereum L2)         |
| Payments    | USDC on Base                                  |

## Arena Tiers

| Arena      | Entry Fee | Grid   | Obstacles | Time Limit |
|------------|-----------|--------|-----------|------------|
| Rookie     | $0.10     | 10x10  | 5         | 60s        |
| Challenger | $0.50     | 15x15  | 12        | 90s        |
| Elite      | $1.00     | 20x20  | 20        | 120s       |
| Master     | $5.00     | 25x25  | 35        | 150s       |
| Legend     | $10.00    | 30x30  | 50        | 180s       |

## Game Flow

1. **Lobby**: 10 bots join an arena and pay the USDC entry fee
2. **Level 1**: All 10 bots race through the grid — top 8 advance
3. **Level 2**: 8 bots race — top 4 advance
4. **Level 3 (Final)**: 4 bots race — winner takes 90% of the pool
5. **Payout**: Prize distributed via smart contract on Base

## Project Structure

```
bot-arena/
├── frontend/    # Next.js 14 + TailwindCSS + RainbowKit
├── backend/     # Express.js + Socket.io + Prisma
├── contracts/   # Hardhat + Solidity (Base)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- A wallet with Base Sepolia ETH (for testnet)

### Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
# API running on http://localhost:5000
```

### Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Environment Variables

Copy the `.env` / `.env.local` files in each directory and fill in your values:

- **Frontend**: `frontend/.env.local`
- **Backend**: `backend/.env`
- **Contracts**: `contracts/.env`

## Contract Addresses

| Contract  | Network       | Address |
|-----------|---------------|---------|
| BotArena  | Base Sepolia  | TBD     |
| BotArena  | Base Mainnet  | TBD     |

## Deployment

- **Frontend**: Vercel
- **Backend**: Railway / Render
- **Contracts**: Base Mainnet via Hardhat

## License

MIT

---

HeyElsa

Built for ClawdKitchen Hackathon
