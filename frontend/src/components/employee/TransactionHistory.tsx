"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useContractEvents } from "@/hooks/useContractEvents";
import { ORGANIZATION_ABI } from "@/lib/contracts";

const ETHERSCAN_URL = "https://sepolia.etherscan.io/tx";

interface TransactionHistoryProps {
  orgAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function TransactionHistory({
  orgAddress,
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: TransactionHistoryProps) {
  const { address } = useAccount();

  const { events: withdrawalEvents, isLoading: loadingWithdrawals } =
    useContractEvents({
      address: orgAddress,
      abi: ORGANIZATION_ABI as any,
      eventName: "Withdrawal",
      args: address ? { employee: address } : undefined,
      enabled: !!orgAddress && !!address,
    });

  const { events: payrollEvents, isLoading: loadingPayroll } =
    useContractEvents({
      address: orgAddress,
      abi: ORGANIZATION_ABI as any,
      eventName: "PayrollExecuted",
      enabled: !!orgAddress,
    });

  // Merge and sort by block number (newest first)
  const allEvents = [
    ...withdrawalEvents.map((e) => ({ ...e, _type: "withdrawal" as const })),
    ...payrollEvents.map((e) => ({ ...e, _type: "payroll" as const })),
  ].sort((a, b) =>
    Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0))),
  );

  const isLoading = loadingWithdrawals || loadingPayroll;
  const [expanded, setExpanded] = useState(false);
  const COLLAPSED_COUNT = 5;
  const visibleEvents = expanded
    ? allEvents
    : allEvents.slice(0, COLLAPSED_COUNT);
  const hasMore = allEvents.length > COLLAPSED_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="glass-card overflow-hidden !hover:transform-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 sm:p-5 py-4">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          <h2
            className="text-base sm:text-lg font-bold truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Transaction History
          </h2>
        </div>
        <span className="text-xs font-medium text-[var(--text-muted)] shrink-0 rounded-full bg-background px-2.5 py-1">
          {allEvents.length} transaction{allEvents.length !== 1 && "s"}
        </span>
      </div>

      <div className="p-3 sm:p-4 space-y-2">
        {isLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">
              Loading transactions...
            </p>
          </div>
        ) : allEvents.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              No transactions yet
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Payroll credits and withdrawals will appear here
            </p>
          </div>
        ) : (
          <>
            {visibleEvents.map((evt, i) => {
              const isWithdrawal = evt._type === "withdrawal";
              const args = evt.args as Record<string, any>;
              const txHash = evt.transactionHash;
              const shortHash = txHash
                ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
                : "";

              return (
                <motion.div
                  key={`${txHash}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-xl bg-[rgba(255,255,255,0.02)] px-3 sm:px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 sm:mt-0 ${
                        isWithdrawal
                          ? "bg-[rgba(239,68,68,0.08)]"
                          : "bg-[rgba(0,229,160,0.08)]"
                      }`}
                    >
                      {isWithdrawal ? (
                        <ArrowUpRight className="h-4 w-4 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-[var(--accent)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">
                        {isWithdrawal ? "Withdrawal" : "Payroll Credit"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] sm:text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="truncate max-w-full">
                          {isWithdrawal
                            ? `−${formatUnits(args.amount ?? BigInt(0), tokenDecimals)} ${tokenSymbol}`
                            : `${args.employeeCount?.toString() ?? "?"} employees paid`}
                        </span>
                        {txHash && (
                          <span className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[var(--border-accent)]">
                              •
                            </span>
                            <a
                              href={`${ETHERSCAN_URL}/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                            >
                              {shortHash}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-medium shrink-0 self-start sm:self-auto shadow-sm ${
                      isWithdrawal
                        ? "bg-[rgba(239,68,68,0.1)] text-red-400 border border-red-500/20"
                        : "bg-[rgba(0,229,160,0.1)] text-[var(--accent)] border border-accent/20"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    {isWithdrawal ? "Sent" : "Received"}
                  </span>
                </motion.div>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:bg-[rgba(255,255,255,0.02)]"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show all ({allEvents.length})
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
