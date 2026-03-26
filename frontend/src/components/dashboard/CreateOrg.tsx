"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowRight, Loader2, Coins, Calendar } from "lucide-react";

const PAYROLL_CYCLES = [
  { label: "One-time", days: 0, desc: "Manual execution only" },
  { label: "Weekly", days: 7, desc: "Every 7 days" },
  { label: "Bi-weekly", days: 14, desc: "Every 14 days" },
  { label: "Monthly", days: 30, desc: "Every 30 days" },
] as const;

interface CreateOrgProps {
  onOrgCreated: (name: string, paymentToken: `0x${string}`, payrollCycleDays: number) => void;
  isDeploying?: boolean;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export function CreateOrg({ onOrgCreated, isDeploying = false }: CreateOrgProps) {
  const [orgName, setOrgName] = useState("");
  const [tokenType, setTokenType] = useState<"eth" | "erc20">("eth");
  const [tokenAddress, setTokenAddress] = useState("");
  const [payrollCycle, setPayrollCycle] = useState(30);

  const handleCreate = () => {
    if (!orgName.trim() || isDeploying) return;
    const paymentToken = tokenType === "eth"
      ? ZERO_ADDRESS
      : (tokenAddress.trim() as `0x${string}`);
    onOrgCreated(orgName.trim(), paymentToken, payrollCycle);
  };

  const isValid = orgName.trim() && (tokenType === "eth" || tokenAddress.trim().startsWith("0x"));

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full max-w-md"
      >
        <div className="border-gradient glow-accent">
          <div className="rounded-2xl bg-[var(--bg-primary)] p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
              <Building2 className="h-8 w-8 text-[var(--accent)]" />
            </div>

            <h2
              className="mb-2 text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Your Organization
            </h2>
            <p className="mb-8 text-sm text-[var(--text-secondary)]">
              Deploy an encrypted payroll contract onchain. All salary data
              will be protected by FHE.
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  disabled={isDeploying}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Payment Token
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTokenType("eth")}
                    disabled={isDeploying}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      tokenType === "eth"
                        ? "border-[var(--border-accent)] bg-[rgba(0,229,160,0.06)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <Coins className="h-4 w-4" />
                    ETH
                  </button>
                  <button
                    type="button"
                    onClick={() => setTokenType("erc20")}
                    disabled={isDeploying}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      tokenType === "erc20"
                        ? "border-[var(--border-accent)] bg-[rgba(0,229,160,0.06)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <Coins className="h-4 w-4" />
                    ERC-20
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {tokenType === "erc20" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Token Contract Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="input-field font-mono text-sm"
                      disabled={isDeploying}
                    />
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                      The ERC-20 token contract address for salary payments
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payroll Cycle */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Payroll Cycle
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYROLL_CYCLES.map((cycle) => (
                    <button
                      key={cycle.days}
                      type="button"
                      onClick={() => setPayrollCycle(cycle.days)}
                      disabled={isDeploying}
                      className={`flex flex-col items-center rounded-xl border px-3 py-2.5 text-center transition-all ${
                        payrollCycle === cycle.days
                          ? "border-[var(--border-accent)] bg-[rgba(0,229,160,0.06)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <span className="text-xs font-semibold">{cycle.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{cycle.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!isValid || isDeploying}
                className="btn-primary w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirm in wallet...
                  </>
                ) : (
                  <>
                    Deploy Organization
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Transaction pending indicator */}
              <AnimatePresence>
                {isDeploying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                        <span className="text-xs text-[var(--text-secondary)]">
                          Waiting for wallet confirmation and transaction...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isDeploying && (
                <p className="text-xs text-[var(--text-muted)] text-center">
                  This will deploy a new smart contract on Ethereum Sepolia
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
