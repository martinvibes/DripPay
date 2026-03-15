"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, Eye, EyeOff, Loader2, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { useFhevm } from "@/hooks/useFhevm";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface RunPayrollCardProps {
  onExecute: () => void;
  activeCount: number;
  contractBalance?: bigint;
  orgAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function RunPayrollCard({
  onExecute,
  activeCount,
  contractBalance,
  orgAddress,
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: RunPayrollCardProps) {
  const ethPrice = useEthPrice();
  const isETH = tokenSymbol === "ETH";
  const hasBalance = contractBalance !== undefined && contractBalance > BigInt(0);
  const hasEmployees = activeCount > 0;
  const canExecute = hasBalance && hasEmployees;

  // Total payroll cost decrypt
  const [totalRevealed, setTotalRevealed] = useState(false);
  const [totalDecrypting, setTotalDecrypting] = useState(false);
  const [totalCost, setTotalCost] = useState<string | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<"sufficient" | "insufficient" | null>(null);

  const { decryptBalance, isReady } = useFhevm();

  const { data: totalPayrollHandle, refetch: refetchTotal } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "getTotalPayrollCost",
    query: { enabled: !!orgAddress },
  });

  const handleRevealTotal = async () => {
    if (totalRevealed) {
      setTotalRevealed(false);
      setTotalCost(null);
      setBudgetStatus(null);
      return;
    }

    if (!isReady || !orgAddress) return;

    setTotalDecrypting(true);

    try {
      const { data: freshHandle } = await refetchTotal();
      const handle = (freshHandle ?? totalPayrollHandle) as `0x${string}`;

      if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setTotalCost("0");
        setBudgetStatus("sufficient");
        setTotalRevealed(true);
        setTotalDecrypting(false);
        return;
      }

      const result = await decryptBalance(handle, orgAddress);
      const raw = typeof result === "bigint" ? result : BigInt(String(result));
      const humanReadable = formatUnits(raw, tokenDecimals);
      const num = parseFloat(humanReadable);
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: num < 1 ? 6 : 2,
        maximumFractionDigits: num < 1 ? 6 : 2,
      });
      setTotalCost(formatted);

      // Compare with contract balance for budget status
      if (contractBalance !== undefined) {
        setBudgetStatus(contractBalance >= raw ? "sufficient" : "insufficient");
      }

      setTotalRevealed(true);
    } catch (err) {
      console.error("[RunPayrollCard] Decrypt error:", err);
    } finally {
      setTotalDecrypting(false);
    }
  };

  return (
    <div className="accent-card overflow-hidden">
      <div className="relative p-4 sm:p-6">
        {/* Animated orbit ring behind the icon */}
        <div className="relative mb-5">
          <div className="relative inline-flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
              <Zap className="h-6 w-6 text-[var(--accent)]" />
            </div>
            {/* Orbiting dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-8px]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-60" />
            </motion.div>
            {/* Orbit ring */}
            <div className="absolute inset-[-8px] rounded-full border border-dashed border-[var(--border-accent)] opacity-40" />
          </div>
        </div>

        <h3
          className="font-bold text-base sm:text-lg mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Run Payroll
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-3 sm:mb-5">
          Execute encrypted batch payment
        </p>

        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
          {/* Active employees */}
          <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">
              Active employees
            </span>
            <span className="font-medium font-mono text-sm">{activeCount}</span>
          </div>

          {/* Total Payroll Cost - prominent reveal */}
          <AnimatePresence mode="wait">
            {totalRevealed && totalCost ? (
              <motion.button
                key="revealed"
                onClick={handleRevealTotal}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-[var(--border-accent)] bg-[rgba(0,229,160,0.04)] p-3 text-left group transition-colors hover:bg-[rgba(0,229,160,0.06)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Total Payroll Cost
                  </span>
                  <EyeOff className="h-3 w-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-xl font-bold font-mono text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {totalCost}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{tokenSymbol}</span>
                  {isETH && ethPrice && totalCost && parseFloat(totalCost.replace(/,/g, "")) > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)] ml-1">
                      (~{formatUsd(parseFloat(totalCost.replace(/,/g, "")) * ethPrice)})
                    </span>
                  )}
                </div>
                {budgetStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                      budgetStatus === "sufficient"
                        ? "text-[var(--accent)]"
                        : "text-red-400"
                    }`}
                  >
                    {budgetStatus === "sufficient" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {budgetStatus === "sufficient"
                      ? "Budget covers payroll"
                      : "Insufficient balance for payroll"}
                  </motion.div>
                )}
              </motion.button>
            ) : (
              <motion.button
                key="encrypted"
                onClick={handleRevealTotal}
                disabled={totalDecrypting || !isReady}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-dashed border-[var(--border-accent)] bg-[rgba(0,229,160,0.02)] p-3 transition-all hover:bg-[rgba(0,229,160,0.05)] hover:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {totalDecrypting ? (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                    <span className="text-xs font-medium text-[var(--accent)]">
                      Decrypting total payroll...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Total Payroll Cost
                      </span>
                      <Lock className="h-3 w-3 text-[var(--text-muted)]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[...Array(6)].map((_, j) => (
                          <span
                            key={j}
                            className="inline-block h-4 w-2 rounded-sm bg-[var(--accent)] opacity-20 group-hover:opacity-30 transition-opacity"
                          />
                        ))}
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] opacity-70 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3.5 w-3.5" />
                        Reveal
                      </span>
                    </div>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Encryption tag */}
          <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">Encryption</span>
            <span className="text-xs font-semibold font-mono text-[var(--accent)]">
              TFHE-256
            </span>
          </div>
        </div>

        <button
          onClick={onExecute}
          disabled={!canExecute}
          className="btn-primary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          {!hasEmployees
            ? "No Employees"
            : !hasBalance
              ? "No Balance"
              : "Execute Payroll"}
        </button>
      </div>
    </div>
  );
}
