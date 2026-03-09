<h1 align="center">DripPay</h1>

<p align="center">
  <strong>Privacy-first on-chain payroll. Salaries nobody can see. Payments everyone can trust.</strong>
</p>

<p align="center">
  <a href="https://sepolia.etherscan.io/address/0xed23CD37400A86C978Ce029aBdCb8F4540d8Ee87">Deployed on Sepolia</a> &middot;
  Built with <a href="https://docs.zama.ai/fhevm">Zama fhEVM</a> &middot;
  <a href="#quickstart">Get Started</a>
</p>

---

## The Problem

Payroll on-chain sounds great until you realize **everyone can see what everyone earns**. Every salary, every payment, every balance — public on the blockchain for anyone to inspect. That's not how the real world works, and it shouldn't be how web3 works either.

## The Solution

DripPay uses **Fully Homomorphic Encryption (FHE)** to make on-chain payroll actually private. Salaries are encrypted *before* they hit the chain. The contract does math on encrypted numbers — adds salaries to balances, compares withdrawal amounts — without ever decrypting them. Only the individual employee can decrypt their own balance, client-side, with their wallet.

**Not even the blockchain validators can see what you earn.**

---

## How It Works

```
Employer                          Smart Contract                      Employee
   |                                    |                                 |
   |-- Create Organization ------------>|                                 |
   |                                    |                                 |
   |-- Add Employee (encrypted salary)->|  FHE.allow(salary, employee)    |
   |                                    |  FHE.allow(salary, admin)       |
   |                                    |                                 |
   |-- Deposit ETH/ERC-20 ------------>|                                 |
   |                                    |                                 |
   |-- Run Payroll -------------------->|  balance += salary (encrypted)  |
   |                                    |                                 |
   |                                    |<--- Decrypt Balance ------------|
   |                                    |     (wallet signature + FHE)    |
   |                                    |                                 |
   |                                    |<--- Withdraw ------------------|
   |                                    |     (real tokens transferred)   |
```

1. **Employer creates an organization** — deploys a contract, picks ETH or ERC-20 for payments
2. **Adds employees with encrypted salaries** — salary amounts are encrypted client-side before the transaction. The contract stores only `euint64` ciphertext
3. **Deposits funds** — real ETH or tokens go into the contract pool
4. **Runs payroll** — one click, the contract adds each employee's encrypted salary to their encrypted balance. All math happens on ciphertext
5. **Employees see their org automatically** — wallet connect, and the factory tells them which orgs they belong to. No contract address needed
6. **Employees decrypt & withdraw** — sign a re-encryption request with their wallet, decrypt client-side, withdraw real tokens

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Encryption** | [Zama fhEVM](https://docs.zama.ai/fhevm) (TFHE on EVM) |
| **Network** | Ethereum Sepolia + Zama coprocessor |
| **Contracts** | Solidity 0.8.27, Hardhat, OpenZeppelin |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Wallet** | wagmi v2, viem, RainbowKit |
| **FHE Client** | fhevmjs (encrypt inputs, decrypt outputs) |
| **Fonts** | Bricolage Grotesque + Plus Jakarta Sans |

---

## Project Structure

```
DripPay/
├── contract/                    # Solidity smart contracts
│   ├── contracts/
│   │   ├── OrganizationFactory.sol   # Deploys orgs, indexes employees
│   │   ├── Organization.sol          # Payroll logic, FHE operations
│   │   └── TestToken.sol             # Mock ERC-20 for testing
│   ├── scripts/deploy.ts            # Deployment script
│   └── hardhat.config.ts
│
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/       # Employer dashboard
│   │   │   ├── employee/        # Employee portal
│   │   │   └── api/             # API routes
│   │   ├── components/          # UI components
│   │   ├── hooks/               # React hooks (useOrganization, useFhevm)
│   │   └── lib/                 # Contracts, ABIs, utilities
│   └── public/
│
└── README.md                    # You are here
```

---

## Smart Contracts

### OrganizationFactory

The entry point. Deploys new Organization contracts and maintains a registry of which employees belong to which orgs.

| Function | Description |
|----------|-------------|
| `createOrg(name, paymentToken)` | Deploy a new org. `address(0)` = ETH payments |
| `getOrganizations(admin)` | Get all orgs an admin created |
| `getEmployeeOrganizations(employee)` | Get all orgs an employee belongs to |

### Organization

Where the magic happens. All salary and balance data is encrypted on-chain using Zama's TFHE library.

| Function | Who | Description |
|----------|-----|-------------|
| `addEmployees(addresses, encryptedSalaries, proof)` | Admin | Add employees with FHE-encrypted salaries |
| `removeEmployee(address)` | Admin | Remove an employee |
| `runPayroll()` | Admin | Add salary to every employee's balance (all encrypted) |
| `deposit(amount)` | Anyone | Fund the org's payment pool |
| `withdraw(amount)` | Employee | Withdraw from accumulated balance |
| `balanceOf(employee)` | View | Get encrypted balance handle for client-side decryption |

**Key FHE operations in `runPayroll()`:**
```solidity
// This addition happens on encrypted values — nobody sees the amounts
euint64 newBalance = FHE.add(_balances[emp], _salaries[emp]);
```

---

## Quickstart

### Prerequisites

- Node.js 18+
- pnpm
- A wallet with Sepolia ETH ([faucet](https://sepoliafaucet.com))

### 1. Clone & Install

```bash
git clone https://github.com/your-username/DripPay.git
cd DripPay

# Install contract dependencies
cd contract && pnpm install

# Install frontend dependencies
cd ../frontend && pnpm install
```

### 2. Environment Setup

```bash
# Contract — create .env
cp contract/.env.example contract/.env
# Add your DEPLOYER_PRIVATE_KEY and INFURA_API_KEY

# Frontend — create .env
cp frontend/.env.example frontend/.env
# Add your NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

### 3. Deploy Contracts (optional — already deployed on Sepolia)

```bash
cd contract
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

Current deployment:
- **OrganizationFactory**: [`0xed23CD37400A86C978Ce029aBdCb8F4540d8Ee87`](https://sepolia.etherscan.io/address/0xed23CD37400A86C978Ce029aBdCb8F4540d8Ee87)

Copy the factory address to `frontend/.env`:
```
NEXT_PUBLIC_FACTORY_ADDRESS=0xed23CD37400A86C978Ce029aBdCb8F4540d8Ee87
```

### 4. Run Frontend

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Flows

### As an Employer

1. Connect wallet on `/dashboard`
2. Create a new organization (choose ETH or ERC-20)
3. Add employees — enter wallet addresses and salary amounts (encrypted before tx)
4. Deposit funds into the org contract
5. Hit "Execute Payroll" — encrypted salaries credited to all employees

### As an Employee

1. Connect wallet on `/employee`
2. Your organizations appear automatically (no contract address needed)
3. Click an org to view your encrypted balance
4. "Decrypt Balance" — sign with your wallet, see your actual balance
5. Withdraw funds whenever you want

---

## The FHE Part (for the curious)

Traditional smart contracts store everything in plaintext. Anyone with an Etherscan link can see every balance and every transfer. DripPay changes this:

**Encryption (employer adding salary):**
```typescript
const instance = await getFhevmInstance();
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(salaryInWei);
const encrypted = await input.encrypt();
// encrypted.handles[0] and encrypted.inputProof go to the contract
```

**On-chain math (contract running payroll):**
```solidity
// FHE.add operates on ciphertext — the EVM never sees plaintext
_balances[emp] = FHE.add(_balances[emp], _salaries[emp]);
```

**Decryption (employee viewing balance):**
```typescript
const { publicKey, privateKey } = instance.generateKeypair();
const eip712 = instance.createEIP712(publicKey, [contractAddress], timestamp, 1);
const signature = await wallet.signTypedData(eip712);
const result = await instance.userDecrypt([{ handle, contractAddress }], ...);
// Only this employee can see the result
```

The key insight: **the contract can do arithmetic on encrypted values without ever decrypting them.** The Zama coprocessor handles the homomorphic operations, and the result is a new ciphertext that only authorized parties (the employee + admin) can decrypt.

---

## Design

DripPay uses a **"Refined Noir"** aesthetic — a pure dark background (`#09090b`) with a single green accent (`#00e5a0`). No rainbow gradients, no multi-color chaos. The UI is designed to feel like a premium fintech product, not a hackathon prototype.

- **Typography**: Bricolage Grotesque for headings, Plus Jakarta Sans for body
- **Animations**: Framer Motion with staggered reveals, spring physics, and subtle hover states
- **Mobile-first**: Fully responsive down to 400px — card layouts on mobile, tables on desktop
- **Dark mode only**: Because payroll apps should look serious

---

## Hackathon

Built for **PL Genesis: Frontiers of Collaboration** (March 2026).

**Target Bounties:**
- **Zama** — Confidential Blockchain Protocol
- **Crecimiento** — Bring Argentina Onchain
- **Funding the Commons** — Bridge Between Builders
- **Fresh Code Track** — $50,000 pool

---

## What's Next

- [ ] Recurring payroll (time-based auto-execution)
- [ ] Multi-sig admin support
- [ ] Payslip generation (encrypted PDF)
- [ ] Phase 2: Confidential Fundraising module
- [ ] Mainnet deployment

---

<p align="center">
  <sub>Salaries are private. Payments are trustless. That's DripPay.</sub>
</p>
