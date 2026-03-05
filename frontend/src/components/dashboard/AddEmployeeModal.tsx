"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  UserPlus,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toHex } from "viem";
import { Modal } from "@/components/shared/Modal";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { getFhevmInstance } from "@/lib/fhevm";

interface AddEmployeeModalProps {
  onClose: () => void;
  onAddEmployee: () => void;
  orgAddress: `0x${string}`;
  existingCount: number;
}

type Step = "form" | "encrypting" | "confirming" | "success" | "error";

export function AddEmployeeModal({
  onClose,
  onAddEmployee,
  orgAddress,
  existingCount,
}: AddEmployeeModalProps) {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  // When tx confirms, show success
  useEffect(() => {
    if (isTxConfirmed && step === "confirming") {
      setStep("success");
      setTimeout(() => onAddEmployee(), 1500);
    }
  }, [isTxConfirmed, step, onAddEmployee]);

  const isValid = wallet.trim() && salary.trim();

  const handleSubmit = async () => {
    if (!isValid || step !== "form") return;

    try {
      setStep("encrypting");

      // Get fhEVM instance and encrypt salary
      const fhevmInstance = await getFhevmInstance();
      const input = fhevmInstance.createEncryptedInput(
        orgAddress,
        wallet.trim() as `0x${string}`
      );
      input.add64(parseInt(salary));
      const encrypted = await input.encrypt();

      setStep("confirming");

      // Call addEmployee on the contract
      writeContract({
        address: orgAddress,
        abi: ORGANIZATION_ABI,
        functionName: "addEmployee",
        args: [
          wallet.trim() as `0x${string}`,
          toHex(encrypted.handles[0]),
          toHex(encrypted.inputProof),
        ],
      });
    } catch (err: any) {
      console.error("AddEmployee error:", err);
      setErrorMsg(err?.shortMessage || err?.message || "Transaction failed");
      setStep("error");
    }
  };

  const modalIcon = (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <UserPlus className="h-4 w-4 text-[var(--accent)]" />
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
          ? "Employee Added"
          : step === "error"
            ? "Error"
            : "Add Employee"
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
                Employee added successfully
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-xs text-[var(--text-muted)]"
            >
              Salary encrypted and stored onchain
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Alice Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    disabled={step !== "form"}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                    Role
                  </label>
                  <input
                    type="text"
                    placeholder="Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field"
                    disabled={step !== "form"}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="input-field font-mono text-sm"
                  disabled={step !== "form"}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Monthly Salary
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="5000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="input-field !pr-20"
                    disabled={step !== "form"}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Lock className="h-3 w-3" />
                    <span>cUSDC</span>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                  Encrypted with FHE before being stored onchain
                </p>
              </div>

              {/* Progress indicator */}
              <AnimatePresence>
                {(step === "encrypting" || step === "confirming") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
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
                            Encrypting salary with FHE...
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
                className="btn-primary w-full !py-3 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step !== "form" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Encrypt & Add Employee
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
