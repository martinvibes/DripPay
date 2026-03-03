import { Download, Wallet } from "lucide-react";

export function WithdrawCard() {
  return (
    <div className="glass-card p-6 !hover:transform-none">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(99,102,241,0.1)]">
          <Download className="h-5 w-5 text-[var(--accent-secondary)]" />
        </div>
        <div>
          <h3
            className="font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Withdraw
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Transfer to your wallet
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              className="input-field !pr-16"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              MAX
            </button>
          </div>
        </div>
      </div>

      <button className="btn-secondary w-full !py-3">
        <Wallet className="h-4 w-4" />
        Withdraw Funds
      </button>
    </div>
  );
}
