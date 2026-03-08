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
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toHex, parseUnits } from "viem";
import { Modal } from "@/components/shared/Modal";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { getFhevmInstance } from "@/lib/fhevm";

interface EmployeeRow {
  id: number;
  name: string;
  role: string;
  wallet: string;
  salary: string;
}

let rowIdCounter = 1;
function createEmptyRow(): EmployeeRow {
  return { id: rowIdCounter++, name: "", role: "", wallet: "", salary: "" };
}

interface AddEmployeeModalProps {
  onClose: () => void;
  onAddEmployee: (infos?: { wallet: string; name: string; role: string }[]) => void;
  orgAddress: `0x${string}`;
  existingCount: number;
  existingAddresses?: `0x${string}`[];
  tokenSymbol?: string;
  tokenDecimals?: number;
}

type Step = "form" | "encrypting" | "confirming" | "success" | "error";

export function AddEmployeeModal({
  onClose,
  onAddEmployee,
  orgAddress,
  existingCount,
  existingAddresses = [],
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: AddEmployeeModalProps) {
  const [rows, setRows] = useState<EmployeeRow[]>([createEmptyRow()]);
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const { address: connectedAddress } = useAccount();
  const { writeContract, data: txHash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  // When tx confirms, show success
  useEffect(() => {
    if (isTxConfirmed && step === "confirming") {
      setStep("success");
      const infos = rows.map((r) => ({
        wallet: r.wallet.trim(),
        name: r.name.trim() || `${r.wallet.trim().slice(0, 6)}...${r.wallet.trim().slice(-4)}`,
        role: r.role.trim() || "Employee",
      }));
      setTimeout(() => onAddEmployee(infos), 1500);
    }
  }, [isTxConfirmed, step, onAddEmployee]);

  // When user rejects or tx fails, show error
  useEffect(() => {
    if (writeError && step === "confirming") {
      setErrorMsg((writeError as any)?.shortMessage || writeError.message || "Transaction failed");
      setStep("error");
      resetWrite();
    }
  }, [writeError, step, resetWrite]);

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRow = (id: number, field: keyof EmployeeRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Validation helpers
  const getDuplicate = (row: EmployeeRow) => {
    const addr = row.wallet.trim().toLowerCase();
    if (!addr.startsWith("0x")) return false;
    // Check against existing on-chain employees
    if (existingAddresses.some((a) => a.toLowerCase() === addr)) return true;
    // Check against other rows in this batch
    return rows.some((r) => r.id !== row.id && r.wallet.trim().toLowerCase() === addr);
  };

  const isRowValid = (row: EmployeeRow) =>
    row.wallet.trim().length > 0 &&
    row.salary.trim().length > 0 &&
    !getDuplicate(row);

  const allValid = rows.every(isRowValid);

  const handleSubmit = async () => {
    if (!allValid || step !== "form") return;

    try {
      setStep("encrypting");

      const fhevmInstance = await getFhevmInstance();
      const input = fhevmInstance.createEncryptedInput(orgAddress, connectedAddress!);

      // Add all salaries to one encrypted input batch
      for (const row of rows) {
        const salaryInSmallestUnit = parseUnits(row.salary, tokenDecimals);
        input.add64(salaryInSmallestUnit);
      }

      const encrypted = await input.encrypt();

      console.log(`[AddEmployees] Batch encrypting ${rows.length} employees`);
      console.log("[AddEmployees] Handles:", encrypted.handles.length);

      setStep("confirming");

      const addresses = rows.map((r) => r.wallet.trim() as `0x${string}`);
      const handles = encrypted.handles.map((h: Uint8Array) => toHex(h));

      writeContract({
        address: orgAddress,
        abi: ORGANIZATION_ABI,
        functionName: "addEmployees",
        args: [addresses, handles, toHex(encrypted.inputProof)],
      });
    } catch (err: any) {
      console.error("AddEmployees error:", err);
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
          ? `${rows.length > 1 ? "Employees" : "Employee"} Added`
          : step === "error"
            ? "Error"
            : "Add Employees"
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
                {rows.length} {rows.length > 1 ? "employees" : "employee"} added successfully
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-xs text-[var(--text-muted)]"
            >
              All salaries encrypted and stored onchain in one transaction
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
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {rows.map((row, idx) => {
                const isDup = getDuplicate(row);
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3"
                  >
                    {/* Row header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        Employee {idx + 1}
                      </span>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          disabled={step !== "form"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Name + Role */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Alice Johnson"
                          value={row.name}
                          onChange={(e) => updateRow(row.id, "name", e.target.value)}
                          className="input-field !text-sm"
                          disabled={step !== "form"}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                          Role
                        </label>
                        <input
                          type="text"
                          placeholder="Engineer"
                          value={row.role}
                          onChange={(e) => updateRow(row.id, "role", e.target.value)}
                          className="input-field !text-sm"
                          disabled={step !== "form"}
                        />
                      </div>
                    </div>

                    {/* Wallet */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={row.wallet}
                        onChange={(e) => updateRow(row.id, "wallet", e.target.value)}
                        className={`input-field font-mono !text-sm ${isDup ? "!border-red-500/50" : ""}`}
                        disabled={step !== "form"}
                      />
                      {isDup && (
                        <p className="mt-1 text-[11px] text-red-400">
                          Duplicate address
                        </p>
                      )}
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                        Monthly Salary
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="5000"
                          value={row.salary}
                          onChange={(e) => updateRow(row.id, "salary", e.target.value)}
                          className="input-field !pr-20 !text-sm"
                          disabled={step !== "form"}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <Lock className="h-3 w-3" />
                          <span>{tokenSymbol}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add another employee button */}
            {step === "form" && (
              <button
                onClick={addRow}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-2.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Another Employee
              </button>
            )}

            <p className="mt-3 text-[11px] text-[var(--text-muted)] text-center">
              {rows.length > 1
                ? `All ${rows.length} salaries will be encrypted with FHE in one transaction`
                : "Salary encrypted with FHE before being stored onchain"}
            </p>

            {/* Progress indicator */}
            <AnimatePresence>
              {(step === "encrypting" || step === "confirming") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3"
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
                          Encrypting {rows.length} {rows.length > 1 ? "salaries" : "salary"} with FHE...
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
              disabled={!allValid || step !== "form"}
              className="btn-primary w-full !py-3 mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step !== "form" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Encrypt & Add {rows.length > 1 ? `${rows.length} Employees` : "Employee"}
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
