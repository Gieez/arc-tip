# ⚡ ArcTip — Native USDC Tipping & Payment Links on Circle Arc L1

> Built for the **Arc Microgrants | Circle** on DoraHacks.  
> Live dApp on Circle's Arc Layer 1 Mainnet (Chain ID `5042`).

[![Arc Mainnet](https://img.shields.io/badge/Arc_Mainnet-5042-00D2FF?style=flat-square)](https://explorer.arc.io)
[![Gas Token](https://img.shields.io/badge/Gas_Token-USDC_(18_dec)-10B981?style=flat-square)](https://explorer.arc.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🎯 What is ArcTip?

**ArcTip** is a non-custodial tipping jar and personal payment link protocol designed specifically for **Arc Layer 1** — Circle's stablecoin-native EVM blockchain where the native gas token **is USDC**.

Anyone (open source maintainers, Web3 creators, freelancers, hackathon builders) can:
1. **Generate a personal tip link** (`arc-tip.vercel.app/tip/0xYourAddress`) or display an interactive QR code.
2. **Receive non-custodial native USDC tips** directly to their wallet.
3. **Attach on-chain memos** recorded permanently on Arc Layer 1 via the `ArcTipJar` contract.
4. **Enjoy zero token approvals**: 1-click payment using `msg.value` directly in USDC with sub-cent gas and sub-second settlement.

---

## 💡 Why Arc Layer 1 Specifically?

On legacy EVM chains (Ethereum, Arbitrum, Polygon), tipping in stablecoins is notoriously painful:
- Senders must hold volatile gas tokens ($ETH, $MATIC) just to pay network fees.
- Senders must submit an ERC-20 `approve()` transaction first, burning extra gas and adding UX friction.
- Tipping $1 costs $0.50 - $2.00 in gas fees.

**On Circle's Arc Layer 1:**
- **Gas IS USDC**: Senders and recipients only ever need a single balance in USDC.
- **18 Decimals Native Asset**: USDC transfers move via native `msg.value` (1 USDC = $10^{18}$ native units).
- **Zero Approvals Needed**: Tipping is a single, atomic 1-block transaction.
- **Sub-Cent Fees (<$0.001)** & **Sub-Second Finality**: Making micro-payments and creator tips truly viable at scale.

---

## 📜 On-Chain Deployment

| Parameter | Value |
|---|---|
| **Network** | Arc Mainnet |
| **Chain ID** | `5042` (`0x13b2`) |
| **RPC Endpoint** | `https://rpc.mainnet.arc.io` |
| **Block Explorer** | [https://explorer.arc.io](https://explorer.arc.io) |
| **Contract (`ArcTipJar`)** | [`0xBD437E3378eae16a082580e26157575523Ba852f`](https://explorer.arc.io/address/0xBD437E3378eae16a082580e26157575523Ba852f) |
| **Deploy Transaction** | [`0x090d02ca7bc17965f541e91d425469c013cbf1224c0b99e097021c48ef91da72`](https://explorer.arc.io/tx/0x090d02ca7bc17965f541e91d425469c013cbf1224c0b99e097021c48ef91da72) |

### Contract Interface (`contracts/ArcTipJar.sol`)

```solidity
function tip(address payable to, string calldata memo) external payable;
function totalReceived(address) external view returns (uint256);
function tipCount(address) external view returns (uint256);
function totalTips() external view returns (uint256);
event Tip(address indexed from, address indexed to, uint256 amount, string memo, uint256 timestamp);
```

- Non-custodial: funds transfer directly to the recipient in the same transaction.
- Tracks recipient stats and emits immutable on-chain memo events.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Fintech Terminal Design System)
- **Web3 Interaction**: Viem v2 (EIP-1193, defineChain, JSON-RPC)
- **Visuals**: Lucide Icons, Canvas Confetti, QRCode SVG
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- An EVM Web3 wallet (MetaMask, Rabby, Coinbase Wallet) configured to Arc Mainnet.

### Installation

```bash
# Clone the repository
git clone https://github.com/Gieez/arc-tip.git
cd arc-tip

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build Production

```bash
npm run build
npm run start
```

---

## 🌐 Connecting to Arc Mainnet Manually

- **Network Name**: Arc Mainnet
- **New RPC URL**: `https://rpc.mainnet.arc.io`
- **Chain ID**: `5042`
- **Currency Symbol**: `USDC`
- **Block Explorer URL**: `https://explorer.arc.io`

*(The app also features a 1-click "Switch to Arc" button that automatically registers the network into MetaMask / Rabby).*

---

## 📄 License

MIT License. Built by [Gieez](https://github.com/Gieez) for the Circle Arc Microgrants Program.
