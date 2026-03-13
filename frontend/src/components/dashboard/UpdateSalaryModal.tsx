"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Loader2,
  Check,
  Sparkles,
  Edit3,
} from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toHex, parseUnits } from "viem";
import { Modal } from "@/components/shared/Modal";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { getFhevmInstance } from "@/lib/fhevm";

interface UpdateSalaryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  orgAddress: `0x${string}`;
  employeeAddress: `0x${string}`;
  employeeName: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

type Step = "form" | "encrypting" | "confirming" | "success" | "error";

export function UpdateSalaryModal({
  onClose,
  onSuccess,
  orgAddress,
  employeeAddress,
  employeeName,
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: UpdateSalaryModalProps) {
  const [newSalary, setNewSalary] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const { address: connectedAddress } = useAccount();
  const { writeContract, data: txHash, error: writeError, reset: resetWrite } = useWriteContract();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (isTxConfirmed && step === "confirming") {
      setStep("success");
      setTimeout(() => onSuccess(), 1500);
    }
  }, [isTxConfirmed, step, onSuccess]);

  useEffect(() => {
    if (writeError && step === "confirming") {
      setErrorMsg((writeError as any)?.shortMessage || writeError.message || "Transaction failed");
      setStep("error");
      resetWrite();
    }
  }, [writeError, step, resetWrite]);

  const isValid = newSalary.trim().length > 0 && Number(newSalary) > 0;

  const handleSubmit = async () => {
    if (!isValid || step !== "form") return;

    try {
      setStep("encrypting");

      const fhevmInstance = await getFhevmInstance();
      const input = fhevmInstance.createEncryptedInput(orgAddress, connectedAddress!);

      const salaryInSmallestUnit = parseUnits(newSalary, tokenDecimals);
      input.add64(salaryInSmallestUnit);

      const encrypted = await input.encrypt();

      setStep("confirming");

      const handle = toHex(encrypted.handles[0]);

      writeContract({
        address: orgAddress,
        abi: ORGANIZATION_ABI,
        functionName: "updateSalary",
        args: [employeeAddress, handle, toHex(encrypted.inputProof)],
      });
    } catch (err: any) {
      console.error("UpdateSalary error:", err);
      setErrorMsg(err?.shortMessage || err?.message || "Transaction failed");
      setStep("error");
    }
  };

  const modalIcon = (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <Edit3 className="h-4 w-4 text-[var(--accent)]" />
      </div>
      {(step === "encrypting" || step === "confirming") && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-4px] rounded-full border border-dashed border-[var(--border-accent)] opacity-50"
        />
      )}
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      title={
        step === "success"
          ? "Salary Updated"
          : step === "error"
            ? "Error"
            : "Update Salary"
      }
      icon={modalIcon}
    >
      <AnimatePresence mode="wait">
        {step === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]"
            >
              <Check className="h-8 w-8 text-[var(--accent)]" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 text-[var(--accent)]"
            >
              <Sparkles className="h-4 w-4" />
              <p
                className="font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Salary updated successfully
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-xs text-[var(--text-muted)]"
            >
              New encrypted salary stored onchain. Total payroll cost updated.
            </motion.p>
          </motion.div>
        ) : step === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center"
          >
            <p className="text-sm text-red-400 mb-4">{errorMsg}</p>
            <button
              onClick={() => {
                setStep("form");
                setErrorMsg("");
              }}
              className="btn-secondary"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Employee info */}
            <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4 mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Employee</p>
              <p className="text-sm font-medium">{employeeName}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                {employeeAddress.slice(0, 6)}...{employeeAddress.slice(-4)}
              </p>
            </div>

            {/* New salary input */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                New Monthly Salary
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="5000"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="input-field !pr-20 !text-sm"
                  disabled={step !== "form"}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Lock className="h-3 w-3" />
                  <span>{tokenSymbol}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] text-center mb-3">
              New salary will be encrypted with FHE. Total payroll cost updates automatically.
            </p>

            {/* Progress indicator */}
            <AnimatePresence>
              {(step === "encrypting" || step === "confirming") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-3"
                >
                  <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        {step === "confirming" ? (
                          <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                        ) : (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                        )}
                        <span className="text-xs text-[var(--text-secondary)]">
                          Encrypting new salary with FHE...
                        </span>
                      </div>
                      {step === "confirming" && (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2.5"
                        >
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                          <span className="text-xs text-[var(--text-secondary)]">
                            Confirm transaction in wallet...
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSubmit}
              disabled={!isValid || step !== "form"}
              className="btn-primary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step !== "form" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Encrypt & Update Salary
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
