"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Check, ExternalLink, ArrowDownLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatUnits } from "viem";
import { useContractEvents } from "@/hooks/useContractEvents";
import { ORGANIZATION_ABI } from "@/lib/contracts";

const ETHERSCAN_URL = "https://sepolia.etherscan.io/tx";

interface PayrollHistoryProps {
  orgAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function PayrollHistory({
  orgAddress,
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: PayrollHistoryProps) {
  const { events: payrollEvents, isLoading: loadingPayroll } = useContractEvents({
    address: orgAddress,
    abi: ORGANIZATION_ABI as any,
    eventName: "PayrollExecuted",
    enabled: !!orgAddress,
  });

  const { events: depositEvents, isLoading: loadingDeposits } = useContractEvents({
    address: orgAddress,
    abi: ORGANIZATION_ABI as any,
    eventName: "Deposit",
    enabled: !!orgAddress,
  });

  // Merge and sort by block number (newest first)
  const allEvents = [
    ...payrollEvents.map((e) => ({ ...e, _type: "payroll" as const })),
    ...depositEvents.map((e) => ({ ...e, _type: "deposit" as const })),
  ].sort((a, b) =>
    Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0)))
  );

  const isLoading = loadingPayroll || loadingDeposits;
  const [expanded, setExpanded] = useState(false);
  const COLLAPSED_COUNT = 5;
  const visibleEvents = expanded ? allEvents : allEvents.slice(0, COLLAPSED_COUNT);
  const hasMore = allEvents.length > COLLAPSED_COUNT;

  return (
    <div className="glass-card overflow-hidden !hover:transform-none">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
            <Clock className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <h3
            className="font-bold text-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Activity History
          </h3>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {allEvents.length} events
        </span>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Loading events...</p>
          </div>
        ) : allEvents.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-[var(--text-muted)]">No activity yet</p>
          </div>
        ) : (
          <>
            {visibleEvents.map((evt, i) => {
              const isPayroll = evt._type === "payroll";
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
                  className="group flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.02)] px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isPayroll ? "bg-[var(--accent)]" : "bg-blue-400"
                        } opacity-60`}
                      />
                      {i < visibleEvents.length - 1 && (
                        <div className="absolute top-3 h-6 w-px bg-[var(--border)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {isPayroll ? "Payroll Executed" : "Deposit"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isPayroll
                          ? `${args.employeeCount?.toString() ?? "?"} employees`
                          : `${formatUnits(args.amount ?? BigInt(0), tokenDecimals)} ${tokenSymbol}`}
                        {txHash && (
                          <>
                            {" · "}
                            <a
                              href={`${ETHERSCAN_URL}/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                            >
                              {shortHash}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,229,160,0.08)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                    <Check className="h-3 w-3" />
                    Confirmed
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
    </div>
  );
}
