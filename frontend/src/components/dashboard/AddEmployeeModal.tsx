"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  UserPlus,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import type { Employee } from "@/lib/mock-data";

interface AddEmployeeModalProps {
  onClose: () => void;
  onAddEmployee: (emp: Employee) => void;
  existingCount: number;
}

const ENCRYPT_STEPS = [
  "Encrypting salary with TFHE...",
  "Generating FHE proof...",
  "Adding to organization contract...",
];

export function AddEmployeeModal({
  onClose,
  onAddEmployee,
  existingCount,
}: AddEmployeeModalProps) {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptStep, setEncryptStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = name.trim() && wallet.trim() && role.trim() && salary.trim();

  const handleSubmit = async () => {
    if (!isValid || isEncrypting) return;

    setIsEncrypting(true);
    setEncryptStep(0);

    for (let i = 0; i < ENCRYPT_STEPS.length; i++) {
      setEncryptStep(i);
      await new Promise((r) => setTimeout(r, 900));
    }

    setEncryptStep(ENCRYPT_STEPS.length);
    await new Promise((r) => setTimeout(r, 400));

    setIsSuccess(true);
    await new Promise((r) => setTimeout(r, 1200));

    const shortAddr = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    const newEmployee: Employee = {
      id: existingCount + 1,
      name: name.trim(),
      address: wallet.length > 10 ? shortAddr : wallet,
      fullAddress: wallet.trim(),
      role: role.trim(),
      status: "active",
      lastPaid: "—",
    };

    onAddEmployee(newEmployee);
    onClose();
  };

  const modalIcon = (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <UserPlus className="h-4 w-4 text-[var(--accent)]" />
      </div>
      {isEncrypting && (
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
      title={isSuccess ? "Employee Added" : "Add Employee"}
      icon={modalIcon}
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* ═══ Success State ═══ */
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
                {name} added successfully
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
        ) : (
          /* ═══ Form State ═══ */
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
                    disabled={isEncrypting}
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
                    disabled={isEncrypting}
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
                  disabled={isEncrypting}
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
                    disabled={isEncrypting}
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

              {/* Encryption progress */}
              <AnimatePresence>
                {isEncrypting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                      <div className="space-y-3">
                        {ENCRYPT_STEPS.map((step, i) => (
                          <motion.div
                            key={step}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-center gap-2.5"
                          >
                            {encryptStep > i ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                              >
                                <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                              </motion.div>
                            ) : encryptStep === i ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border border-[var(--border)]" />
                            )}
                            <span
                              className={`text-xs ${
                                encryptStep >= i
                                  ? "text-[var(--text-secondary)]"
                                  : "text-[var(--text-muted)]"
                              }`}
                            >
                              {step}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSubmit}
                disabled={!isValid || isEncrypting}
                className="btn-primary w-full !py-3 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Encrypting...
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
