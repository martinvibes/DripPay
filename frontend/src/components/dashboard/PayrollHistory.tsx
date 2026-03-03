"use client";

import { motion } from "framer-motion";
import { Clock, Check } from "lucide-react";
import { payrollHistory } from "@/lib/mock-data";

export function PayrollHistory() {
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
            Payroll History
          </h3>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {payrollHistory.length} runs
        </span>
      </div>

      <div className="p-4 space-y-2">
        {payrollHistory.map((run, i) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="group flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.02)] px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center gap-3">
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-[var(--accent)] opacity-60" />
                {i < payrollHistory.length - 1 && (
                  <div className="absolute top-3 h-6 w-px bg-[var(--border)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{run.date}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {run.employees} employees &middot;{" "}
                  <span className="font-mono">{run.txHash}</span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,229,160,0.08)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
              <Check className="h-3 w-3" />
              {run.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
