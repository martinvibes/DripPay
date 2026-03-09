"use client";

import { motion } from "framer-motion";
import { Zap, Play } from "lucide-react";
import { EncryptedValue } from "@/components/shared/EncryptedValue";

interface RunPayrollCardProps {
  onExecute: () => void;
  activeCount: number;
  contractBalance?: bigint;
}

export function RunPayrollCard({ onExecute, activeCount, contractBalance }: RunPayrollCardProps) {
  const hasBalance = contractBalance !== undefined && contractBalance > BigInt(0);
  const hasEmployees = activeCount > 0;
  const canExecute = hasBalance && hasEmployees;

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
          <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">
              Active employees
            </span>
            <span className="font-medium font-mono text-sm">{activeCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">
              Total salaries
            </span>
            <EncryptedValue bars={4} />
          </div>
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
