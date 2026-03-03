import { Clock, Check } from "lucide-react";
import { payrollHistory } from "@/lib/mock-data";

export function PayrollHistory() {
  return (
    <div className="glass-card p-5 !hover:transform-none">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-[var(--text-muted)]" />
        <h3
          className="font-bold text-sm"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Payroll History
        </h3>
      </div>

      <div className="space-y-3">
        {payrollHistory.map((run) => (
          <div
            key={run.id}
            className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.02)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{run.date}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {run.employees} employees &middot;{" "}
                <span className="font-mono">{run.txHash}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,229,160,0.1)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
              <Check className="h-3 w-3" />
              {run.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
