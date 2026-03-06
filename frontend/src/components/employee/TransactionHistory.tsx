"use client";

import { motion } from "framer-motion";
import { Clock, Shield } from "lucide-react";

export function TransactionHistory() {
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

      <div className="p-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
          <Shield className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-1">
          Encrypted on-chain
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Transaction history is encrypted. Payroll credits and withdrawals are
          recorded on-chain with FHE privacy.
        </p>
      </div>
    </motion.div>
  );
}
