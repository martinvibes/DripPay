# CLAUDE.md — DripPay

## Project Overview

DripPay is a privacy-first on-chain payroll platform built on Zama's fhEVM (Fully Homomorphic Encryption EVM). Employers can create organizations, add employees, assign encrypted salaries, and trigger manual batch payroll — all while keeping salary amounts, balances, and disbursements fully encrypted on-chain. Nobody except the individual employee can see what they earn.

This project is being built for the **PL Genesis: Frontiers of Collaboration Hackathon** (deadline: March 16, 2026).

### Target Bounties
- **Zama** — Confidential Blockchain Protocol (primary bounty — FHE-encrypted payroll)
- **Crecimiento** — Bring Argentina Onchain (real-world crypto payroll demand)
- **Funding the Commons** — Bridge Between Builders (Phase 2: fundraising module)
- **Fresh Code Track** — $50,000 pool (10 teams x $5,000)

### Phase 1: Confidential Payroll (BUILD THIS FIRST)
Employer connects wallet → creates organization → adds employees by wallet address → assigns encrypted salary amounts → triggers manual batch payroll → employees claim/view only their own balance (decrypted client-side).

### Phase 2: Confidential Fundraising (BUILD ONLY AFTER PHASE 1 WORKS)
Teams/DAOs raise funds on-chain with individual contribution amounts encrypted, but totals publicly verifiable. DO NOT start Phase 2 until Phase 1 payroll is fully functional and tested.

---

## Tech Stack

- **Blockchain**: Zama fhEVM (EVM-compatible with FHE support)
- **Network**: Zama devnet / Ethereum Sepolia with Zama coprocessor
- **Smart Contracts**: Solidity + Zama fhEVM Solidity library (`fhevm/lib`)
- **Frontend**: Next.js + TypeScript
- **Wallet Integration**: wagmi + viem + RainbowKit (or ConnectKit)
- **Styling**: Tailwind CSS
- **Package Manager**: npm or pnpm

---

## Architecture — Agent Roles

This project is split into independent workstreams. Each agent focuses on ONE area.

### Agent 1: Smart Contract Agent
**Scope**: Everything in `/contracts`
**Responsibilities**:
- Write Solidity smart contracts using Zama's fhEVM library
- Core contracts:
  - `OrganizationFactory.sol` — deploys new organization instances
  - `Organization.sol` — manages employees, encrypted salaries, batch payroll execution
  - `ConfidentialToken.sol` — encrypted ERC-20 for salary payments (using Zama's `TFHE` library for encrypted uint operations)
- Write deployment scripts (Hardhat or Foundry)
- Write unit tests
- Handle FHE-specific logic: encrypting salary amounts with `TFHE.asEuint64()`, permission-based decryption with `TFHE.allow()`, encrypted transfers

**Key Zama fhEVM patterns**:
```solidity
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

// Encrypted state
euint64 private encryptedSalary;

// Set encrypted value
encryptedSalary = TFHE.asEuint64(amount); // encrypt
TFHE.allow(encryptedSalary, employeeAddress); // grant view access

// Encrypted transfer (no one sees the amount)
balances[employee] = TFHE.add(balances[employee], salary);
```

**Do NOT**: Touch frontend code, modify anything outside `/contracts`.

---

### Agent 2: Frontend Agent
**Scope**: Everything in `/frontend`
**Responsibilities**:
- Next.js app with TypeScript
- Pages/routes:
  - `/` — Landing page (explain what ConfidentialPay does)
  - `/dashboard` — Employer dashboard (create org, add employees, trigger payroll)
  - `/employee` — Employee view (see own decrypted balance, claim history)
- Wallet connection via wagmi/viem
- Call smart contract functions using generated ABIs
- Handle FHE client-side decryption (Zama's `fhevmjs` library for re-encryption requests)
- Responsive UI with Tailwind CSS

**Key Zama frontend pattern**:
```typescript
import { createInstance } from "fhevmjs";

// Initialize fhEVM instance
const instance = await createInstance({
  networkUrl: "https://devnet.zama.ai",
  gatewayUrl: "https://gateway.zama.ai",
});

// Encrypt input (employer setting salary)
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(salaryAmount);
const encryptedInput = input.encrypt();

// Decrypt own balance (employee viewing)
const balanceHandle = await contract.balanceOf(userAddress);
const { publicKey, privateKey } = instance.generateKeypair();
const eip712 = instance.createEIP712(publicKey, contractAddress);
const signature = await signer.signTypedData(eip712);
const decryptedBalance = await instance.reencrypt(
  balanceHandle, privateKey, publicKey, signature, contractAddress, userAddress
);
```

**Do NOT**: Write or modify smart contracts, touch anything in `/contracts`.

---

### Agent 3: Integration & DevOps Agent
**Scope**: Root config, deployment, CI, connecting contracts ↔ frontend
**Responsibilities**:
- Project scaffolding (monorepo structure, package.json, tsconfig)
- Hardhat/Foundry config for Zama devnet
- Generate and copy ABIs from `/contracts` to `/frontend`
- Environment variables (.env.example)
- Deployment scripts to Zama devnet
- README with setup instructions
- Docker compose if needed

**Do NOT**: Write core business logic in contracts or build UI components.

---

## Project Structure

```
confidentialpay/
├── CLAUDE.md                    # This file — project context
├── README.md                    # Setup instructions
├── .env.example                 # Environment variables template
│
├── contracts/                   # Agent 1: Smart Contract Agent
│   ├── src/
│   │   ├── OrganizationFactory.sol
│   │   ├── Organization.sol
│   │   └── ConfidentialToken.sol
│   ├── test/
│   │   └── Organization.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   ├── foundry.toml
│   └── package.json
│
├── frontend/                    # Agent 2: Frontend Agent
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   │   ├── page.tsx         # Landing
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Employer dashboard
│   │   │   └── employee/
│   │   │       └── page.tsx     # Employee view
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── CreateOrg.tsx
│   │   │   ├── AddEmployee.tsx
│   │   │   ├── RunPayroll.tsx
│   │   │   └── EmployeeBalance.tsx
│   │   ├── hooks/
│   │   │   ├── useOrganization.ts
│   │   │   └── useFhevm.ts
│   │   ├── lib/
│   │   │   ├── contracts.ts     # ABI imports + contract addresses
│   │   │   └── fhevm.ts         # Zama fhevmjs setup
│   │   └── providers/
│   │       └── Web3Provider.tsx
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
└── packages/                    # Shared (Agent 3 manages)
    └── config/
        └── networks.ts          # Chain configs, RPC URLs
```

---

## Core User Flows

### Flow 1: Employer Creates Organization
1. Connect wallet
2. Click "Create Organization" → calls `OrganizationFactory.createOrg(name)`
3. New `Organization` contract deployed
4. Employer is set as admin

### Flow 2: Employer Adds Employee
1. Enter employee wallet address
2. Enter salary amount (plaintext in UI)
3. Frontend encrypts salary using `fhevmjs` → sends encrypted input to contract
4. Contract stores `euint64` encrypted salary mapped to employee address
5. Calls `TFHE.allow()` so only that employee + admin can decrypt

### Flow 3: Employer Runs Batch Payroll
1. Employer clicks "Run Payroll"
2. Contract iterates through employee list
3. For each employee: `balances[emp] = TFHE.add(balances[emp], salaries[emp])`
4. All additions happen on encrypted values — no one sees amounts
5. Event emitted: `PayrollExecuted(orgAddress, timestamp, employeeCount)`

### Flow 4: Employee Views Balance
1. Employee connects wallet
2. Frontend calls `contract.balanceOf(employeeAddress)` → gets encrypted handle
3. Employee signs EIP-712 re-encryption request
4. `fhevmjs` decrypts balance client-side using employee's keypair
5. Balance displayed only to that employee

### Flow 5: Employee Withdraws
1. Employee clicks "Withdraw"
2. Contract calls encrypted transfer from org balance to employee wallet
3. Encrypted balance decremented

---

## Zama fhEVM Resources
- Docs: https://docs.zama.org/fhevm
- Solidity lib: https://github.com/zama-ai/fhevm
- Frontend lib (fhevmjs): https://github.com/zama-ai/fhevmjs
- Example contracts: https://github.com/zama-ai/fhevm/tree/main/examples
- Hardhat template: https://github.com/zama-ai/fhevm-hardhat-template
- React template: https://github.com/zama-ai/fhevm-react-template

---

## Rules
- Phase 1 (Payroll) MUST be fully working before touching Phase 2 (Fundraising)
- Keep it simple — manual batch payroll triggered by employer (Option A)
- No over-engineering — this is a hackathon MVP, not a production system
- Use Zama's existing templates and examples as starting points where possible
- Each agent stays in their lane — contracts agent doesn't touch frontend, frontend agent doesn't touch contracts
- Encrypted values MUST use Zama's TFHE library — never store plaintext salaries on-chain
