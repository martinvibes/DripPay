import { Shield, Zap, Eye, Users, Wallet, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ═══ Landing Page Data ═══ */

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Shield,
    title: "Encrypted Salaries",
    description:
      "Salary amounts are encrypted using Fully Homomorphic Encryption. Not even validators can see what employees earn.",
  },
  {
    icon: Zap,
    title: "Batch Payroll",
    description:
      "Execute payroll for your entire organization in a single encrypted transaction. Fast, efficient, completely private.",
  },
  {
    icon: Eye,
    title: "Employee Self-Service",
    description:
      "Employees connect their wallet to decrypt and view only their own balance. No one else can see it — ever.",
  },
];

export interface Step {
  num: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const steps: Step[] = [
  {
    num: "01",
    title: "Create Organization",
    description:
      "Connect your wallet and deploy your encrypted org contract onchain.",
    icon: Users,
  },
  {
    num: "02",
    title: "Add Employees",
    description:
      "Enter wallet addresses. Set salaries — encrypted before they hit the chain.",
    icon: Wallet,
  },
  {
    num: "03",
    title: "Run Payroll",
    description:
      "One click. Encrypted salary credits distributed to all employees simultaneously.",
    icon: Zap,
  },
  {
    num: "04",
    title: "Claim & Decrypt",
    description:
      "Employees view their own balance — decrypted client-side with their wallet keys.",
    icon: Lock,
  },
];

export const stats = [
  { value: "100%", label: "Encrypted", sublabel: "Salary data" },
  { value: "0", label: "Plaintext", sublabel: "On-chain exposure" },
  { value: "FHE", label: "Powered", sublabel: "Zama fhEVM" },
  { value: "1-Click", label: "Payroll", sublabel: "Batch execution" },
];

/* ═══ Dashboard Data ═══ */

export interface Employee {
  id: number;
  address: string;
  fullAddress: string;
  name: string;
  role: string;
  status: string;
  lastPaid: string;
}

export const mockEmployees: Employee[] = [
  {
    id: 1,
    address: "0x7a3B...f92e",
    fullAddress: "0x7a3B4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f792e",
    name: "Alice Johnson",
    role: "Engineer",
    status: "active",
    lastPaid: "Feb 28, 2026",
  },
  {
    id: 2,
    address: "0x1f8C...a41d",
    fullAddress: "0x1f8C3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a41d",
    name: "Bob Martinez",
    role: "Designer",
    status: "active",
    lastPaid: "Feb 28, 2026",
  },
  {
    id: 3,
    address: "0x9e2A...b73f",
    fullAddress: "0x9e2A5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0b73f",
    name: "Carol Chen",
    role: "PM",
    status: "active",
    lastPaid: "Feb 28, 2026",
  },
  {
    id: 4,
    address: "0x4d6B...e28a",
    fullAddress: "0x4d6B7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2e28a",
    name: "David Kim",
    role: "Engineer",
    status: "pending",
    lastPaid: "—",
  },
];

export interface PayrollRun {
  id: number;
  date: string;
  employees: number;
  txHash: string;
  status: string;
}

export const payrollHistory: PayrollRun[] = [
  {
    id: 1,
    date: "Feb 28, 2026",
    employees: 3,
    txHash: "0xabc...123",
    status: "completed",
  },
  {
    id: 2,
    date: "Jan 31, 2026",
    employees: 3,
    txHash: "0xdef...456",
    status: "completed",
  },
  {
    id: 3,
    date: "Dec 31, 2025",
    employees: 2,
    txHash: "0x789...abc",
    status: "completed",
  },
];

/* ═══ Employee Data ═══ */

export interface Transaction {
  id: number;
  type: "credit" | "withdrawal";
  label: string;
  date: string;
  txHash: string;
  status: string;
  amount?: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: "credit",
    label: "March Payroll",
    date: "Mar 1, 2026",
    txHash: "0xf3a...8d2c",
    status: "completed",
    amount: "5,000.00",
  },
  {
    id: 2,
    type: "credit",
    label: "February Payroll",
    date: "Feb 28, 2026",
    txHash: "0xa1b...5e7f",
    status: "completed",
    amount: "4,200.00",
  },
  {
    id: 3,
    type: "withdrawal",
    label: "Withdrawal",
    date: "Feb 15, 2026",
    txHash: "0x9c4...2a1b",
    status: "completed",
    amount: "2,000.00",
  },
  {
    id: 4,
    type: "credit",
    label: "January Payroll",
    date: "Jan 31, 2026",
    txHash: "0x7e2...f9d3",
    status: "completed",
    amount: "3,800.00",
  },
  {
    id: 5,
    type: "withdrawal",
    label: "Withdrawal",
    date: "Jan 20, 2026",
    txHash: "0x3b8...c6e4",
    status: "completed",
    amount: "1,500.00",
  },
];
