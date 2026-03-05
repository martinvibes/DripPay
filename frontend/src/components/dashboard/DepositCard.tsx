"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, Loader2, Check, Wallet } from "lucide-react";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { useERC20 } from "@/hooks/useERC20";
import { fadeUpSmall } from "@/lib/animations";

interface DepositCardProps {
  orgAddress: `0x${string}`;
  isETH: boolean;
  paymentToken?: `0x${string}`;
  contractBalance?: bigint;
  tokenSymbol?: string;
  tokenDecimals?: number;
  onDeposit: (amount: bigint, isETH: boolean) => void;
  isPending: boolean;
  refetchBalance: () => void;
}

export function DepositCard({
  orgAddress,
  isETH,
  paymentToken,
  contractBalance,
  tokenSymbol,
  tokenDecimals = 18,
  onDeposit,
  isPending,
  refetchBalance,
}: DepositCardProps) {
  const [amount, setAmount] = useState("");

  const {
    approve,
    isApproving,
    allowance,
    refetchAllowance,
  } = useERC20(
    !isETH ? paymentToken : undefined,
    !isETH ? orgAddress : undefined,
  );

  const parsedAmount = (() => {
    if (!amount || isNaN(Number(amount))) return BigInt(0);
    if (isETH) {
      return parseEther(amount);
    }
    return BigInt(Math.floor(Number(amount) * 10 ** tokenDecimals));
  })();

  const needsApproval = !isETH && allowance !== undefined && parsedAmount > BigInt(0) && allowance < parsedAmount;

  const formatBalance = (bal?: bigint) => {
    if (bal === undefined) return "—";
    if (isETH) {
      const eth = Number(bal) / 1e18;
      return eth.toFixed(eth < 0.01 ? 6 : 4);
    }
    const dec = tokenDecimals || 18;
    const val = Number(bal) / 10 ** dec;
    return val.toFixed(val < 0.01 ? 6 : 2);
  };

  const symbol = isETH ? "ETH" : tokenSymbol || "TOKEN";

  const handleDeposit = () => {
    if (parsedAmount <= BigInt(0)) return;
    onDeposit(parsedAmount, isETH);
    setAmount("");
    // Refetch balance after a short delay for tx to propagate
    setTimeout(() => {
      refetchBalance();
      if (!isETH) refetchAllowance();
    }, 3000);
  };

  const handleApprove = () => {
    if (parsedAmount <= BigInt(0)) return;
    approve(parsedAmount);
    setTimeout(() => refetchAllowance(), 3000);
  };

  return (
    <motion.div
      variants={fadeUpSmall}
      initial="hidden"
      animate="visible"
      className="stat-card group relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--accent)] opacity-0 blur-[30px] transition-opacity duration-500 group-hover:opacity-[0.08]" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] transition-colors group-hover:bg-[rgba(0,229,160,0.12)]">
            <Wallet className="h-5 w-5 text-[var(--accent)]" />
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-1">Contract Balance</p>
        <p
          className="text-xl font-bold tracking-tight mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatBalance(contractBalance)} <span className="text-sm font-normal text-[var(--text-muted)]">{symbol}</span>
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mb-4">
          Available for employee withdrawals
        </p>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="any"
              min="0"
              className="input-field !pr-16 text-sm"
              disabled={isPending || isApproving}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-medium">
              {symbol}
            </div>
          </div>

          {needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isApproving || parsedAmount <= BigInt(0)}
              className="btn-secondary w-full !py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Approve {symbol}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDeposit}
              disabled={isPending || parsedAmount <= BigInt(0)}
              className="btn-primary w-full !py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  Deposit {symbol}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
