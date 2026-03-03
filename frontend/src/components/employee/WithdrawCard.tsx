"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Wallet, Loader2, Check, ExternalLink, Lock } from "lucide-react";

interface WithdrawCardProps {
  balance: number;
  onWithdraw: (amount: number) => void;
}

const WITHDRAW_STEPS = [
  "Decrypting withdrawal amount...",
  "Processing encrypted transfer...",
];

const MOCK_TX = "0x8b2f...4c1a";

export function WithdrawCard({ balance, onWithdraw }: WithdrawCardProps) {
  const [amount, setAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= balance;

  const handleWithdraw = async () => {
    if (!isValid || isWithdrawing) return;

    setIsWithdrawing(true);
    setWithdrawStep(0);

    for (let i = 0; i < WITHDRAW_STEPS.length; i++) {
      setWithdrawStep(i);
      await new Promise((r) => setTimeout(r, 1200));
    }

    setWithdrawStep(WITHDRAW_STEPS.length);
    await new Promise((r) => setTimeout(r, 400));

    setWithdrawnAmount(amount);
    setIsSuccess(true);
    onWithdraw(numAmount);

    // Auto-reset after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setIsWithdrawing(false);
      setAmount("");
      setWithdrawStep(0);
    }, 3000);
  };

  const handleMax = () => {
    setAmount(balance.toFixed(2));
  };

  return (
    <div className="accent-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
              <Download className="h-5 w-5 text-[var(--accent)]" />
            </div>
            {isWithdrawing && !isSuccess && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-4px] rounded-full border border-dashed border-[var(--border-accent)] opacity-40"
              />
            )}
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

        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* ═══ Success State ═══ */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-3 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]"
              >
                <Check className="h-6 w-6 text-[var(--accent)]" />
              </motion.div>
              <p
                className="font-bold gradient-text text-lg mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {withdrawnAmount} cUSDC
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Withdrawn successfully
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]">
                <span className="font-mono">{MOCK_TX}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </div>
            </motion.div>
          ) : (
            /* ═══ Form State ═══ */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Amount
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Balance: {balance.toLocaleString()} cUSDC
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field !pr-20"
                      disabled={isWithdrawing}
                    />
                    <button
                      onClick={handleMax}
                      disabled={isWithdrawing}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors disabled:opacity-40"
                    >
                      MAX
                    </button>
                  </div>
                  {numAmount > balance && (
                    <p className="mt-1 text-[11px] text-red-400">
                      Exceeds available balance
                    </p>
                  )}
                </div>
              </div>

              {/* Withdraw progress */}
              <AnimatePresence>
                {isWithdrawing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="rounded-lg bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-3 space-y-2.5">
                      {WITHDRAW_STEPS.map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="flex items-center gap-2"
                        >
                          {withdrawStep > i ? (
                            <Check className="h-3 w-3 text-[var(--accent)]" />
                          ) : withdrawStep === i ? (
                            <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-[var(--border)]" />
                          )}
                          <span
                            className={`text-[11px] ${
                              withdrawStep >= i
                                ? "text-[var(--text-secondary)]"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            {step}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleWithdraw}
                disabled={!isValid || isWithdrawing}
                className="btn-secondary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Withdraw Funds
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
