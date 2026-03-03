"use client";

import { motion } from "framer-motion";
import { Clock, ArrowDownRight, ArrowUpRight, Lock, Check } from "lucide-react";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import { mockTransactions } from "@/lib/mock-data";

interface TransactionHistoryProps {
  isRevealed: boolean;
}

export function TransactionHistory({ isRevealed }: TransactionHistoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="glass-card overflow-hidden !hover:transform-none"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--text-muted)]" />
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Transaction History
          </h2>
        </div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {mockTransactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="flex items-center justify-between px-5 py-4 hover:bg-[rgba(255,255,255,0.01)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  tx.type === "credit"
                    ? "bg-[rgba(0,229,160,0.1)]"
                    : "bg-[rgba(99,102,241,0.1)]"
                }`}
              >
                {tx.type === "credit" ? (
                  <ArrowDownRight className="h-4 w-4 text-[var(--accent)]" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-[var(--accent-secondary)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{tx.label}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {tx.date} &middot;{" "}
                  <span className="font-mono">{tx.txHash}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5">
                {isRevealed && tx.amount ? (
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === "credit"
                        ? "text-[var(--accent)]"
                        : "text-[var(--accent-secondary)]"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {tx.amount} cUSDC
                  </span>
                ) : (
                  <EncryptedValue bars={4} />
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Check className="h-3 w-3" />
                {tx.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
