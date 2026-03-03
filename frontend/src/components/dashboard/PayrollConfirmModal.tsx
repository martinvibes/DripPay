"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Lock, Loader2, Check, ExternalLink, PartyPopper } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import type { Employee } from "@/lib/mock-data";

interface PayrollConfirmModalProps {
  onClose: () => void;
  onExecute: () => void;
  employees: Employee[];
}

const EXEC_STEPS = [
  { label: "Preparing encrypted batch...", icon: Lock },
  { label: "Computing on ciphertext...", icon: Zap },
  { label: "Broadcasting transaction...", icon: Zap },
  { label: "Confirming on Sepolia...", icon: Check },
];

const MOCK_TX = "0x3f8a...7e2d";

export function PayrollConfirmModal({
  onClose,
  onExecute,
  employees,
}: PayrollConfirmModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [execStep, setExecStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeEmployees = employees.filter((e) => e.status === "active");

  const handleExecute = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecStep(0);

    for (let i = 0; i < EXEC_STEPS.length; i++) {
      setExecStep(i);
      await new Promise((r) => setTimeout(r, 1000));
    }

    setExecStep(EXEC_STEPS.length);
    await new Promise((r) => setTimeout(r, 400));

    setIsSuccess(true);
    onExecute();
  };

  const modalIcon = (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <Zap className="h-4 w-4 text-[var(--accent)]" />
      </div>
      {isExecuting && !isSuccess && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-4px] rounded-full border border-dashed border-[var(--border-accent)] opacity-50"
        />
      )}
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      title={isSuccess ? "Payroll Complete" : isExecuting ? "Executing Payroll" : "Confirm Payroll"}
      icon={modalIcon}
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* ═══ Success State ═══ */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4"
          >
            {/* Big success circle */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="mx-auto mb-4 relative"
              >
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]">
                  <Check className="h-10 w-10 text-[var(--accent)]" />
                </div>
                {/* Success pulse ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: 2, ease: "easeOut" }}
                  className="absolute inset-0 mx-auto h-20 w-20 rounded-full border border-[var(--accent)]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <PartyPopper className="h-4 w-4 text-[var(--accent)]" />
                <p
                  className="font-bold text-lg gradient-text"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Payroll Executed
                </p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-[var(--text-secondary)]"
              >
                {activeEmployees.length} employees paid successfully
              </motion.p>
            </div>

            {/* Tx details */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Transaction</span>
                <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent)]">
                  {MOCK_TX}
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Employees</span>
                <span className="font-medium">{activeEmployees.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Network</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">Ethereum Sepolia</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Encryption</span>
                <span className="text-xs font-mono font-semibold text-[var(--accent)]">TFHE-256</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="btn-primary w-full !py-3 mt-5"
            >
              Done
            </motion.button>
          </motion.div>
        ) : isExecuting ? (
          /* ═══ Executing State ═══ */
          <motion.div
            key="executing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-2"
          >
            {/* Progress bar */}
            <div className="mb-5 h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${((execStep + 1) / EXEC_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-dim)] to-[var(--accent)]"
              />
            </div>

            <div className="space-y-3">
              {EXEC_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card)]">
                    {execStep > i ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                      >
                        <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                      </motion.div>
                    ) : execStep === i ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-[var(--text-muted)] opacity-30" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      execStep >= i
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
              All salary amounts remain encrypted throughout execution
            </p>
          </motion.div>
        ) : (
          /* ═══ Confirm State ═══ */
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  You are about to execute encrypted batch payroll for{" "}
                  <span className="font-bold text-[var(--text-primary)]">
                    {activeEmployees.length} active employees
                  </span>
                  . All salary amounts will remain encrypted throughout.
                </p>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeEmployees.map((emp, i) => {
                  const initials = emp.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("");

                  return (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[10px] font-bold text-[var(--accent)]">
                          {initials}
                        </div>
                        <span className="text-sm">{emp.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{emp.role}</span>
                      </div>
                      <EncryptedValue bars={4} barHeight="h-2.5" />
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1 !py-3">
                  Cancel
                </button>
                <button onClick={handleExecute} className="btn-primary flex-1 !py-3">
                  <Zap className="h-4 w-4" />
                  Execute
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
