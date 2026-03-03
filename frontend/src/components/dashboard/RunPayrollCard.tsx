"use client";

import { Zap, Play, Lock } from "lucide-react";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import { mockEmployees } from "@/lib/mock-data";

interface RunPayrollCardProps {
  onExecute: () => void;
}

export function RunPayrollCard({ onExecute }: RunPayrollCardProps) {
  const activeCount = mockEmployees.filter(
    (e) => e.status === "active"
  ).length;

  return (
    <div className="border-gradient glow-accent">
      <div className="rounded-2xl bg-[var(--bg-primary)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
            <Zap className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <h3
              className="font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Run Payroll
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Execute encrypted batch payment
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              Active employees
            </span>
            <span className="font-medium">{activeCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              Total salaries
            </span>
            <EncryptedValue bars={4} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Encryption</span>
            <span className="text-xs font-medium text-[var(--accent)]">
              TFHE-256
            </span>
          </div>
        </div>

        <button onClick={onExecute} className="btn-primary w-full !py-3">
          <Play className="h-4 w-4" />
          Execute Payroll
        </button>
      </div>
    </div>
  );
}
