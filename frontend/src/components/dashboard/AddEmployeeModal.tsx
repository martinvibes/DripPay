"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  FileSpreadsheet,
  Download,
  AlertCircle,
  X,
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

// ── CSV Parsing ─────────────────────────────────────────────────────────
function parseCSV(text: string): { rows: Omit<EmployeeRow, "id">[]; errors: string[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { rows: [], errors: ["File is empty"] };

  // Detect header — check if first line contains "name" or "wallet"
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes("name") ||
    firstLine.includes("wallet") ||
    firstLine.includes("address") ||
    firstLine.includes("salary");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const parsed: Omit<EmployeeRow, "id">[] = [];
  const errors: string[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const lineNum = hasHeader ? i + 2 : i + 1;
    // Handle quoted fields with commas inside them
    const cols = dataLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!cols || cols.length < 2) {
      errors.push(`Line ${lineNum}: not enough columns`);
      continue;
    }

    const clean = cols.map((c) => c.trim().replace(/^"|"$/g, "").trim());

    // Support both 4-col (name,role,wallet,salary) and 2-col (wallet,salary)
    let name = "";
    let role = "";
    let wallet = "";
    let salary = "";

    if (cols.length >= 4) {
      [name, role, wallet, salary] = clean;
    } else if (cols.length === 3) {
      // Could be name,wallet,salary or role,wallet,salary — treat first as name
      [name, wallet, salary] = clean;
    } else {
      [wallet, salary] = clean;
    }

    // Validate wallet looks like an address
    if (!wallet.startsWith("0x") || wallet.length < 10) {
      errors.push(`Line ${lineNum}: invalid wallet address "${wallet.slice(0, 20)}..."`);
      continue;
    }

    // Validate salary is a number
    if (isNaN(Number(salary)) || Number(salary) <= 0) {
      errors.push(`Line ${lineNum}: invalid salary "${salary}"`);
      continue;
    }

    parsed.push({ name, role, wallet, salary });
  }

  return { rows: parsed, errors };
}

function generateCSVTemplate(): string {
  return [
    "name,role,wallet,salary",
    "Alice Johnson,Engineer,0x1234567890abcdef1234567890abcdef12345678,5000",
    "Bob Smith,Designer,0xabcdef1234567890abcdef1234567890abcdef12,4500",
  ].join("\n");
}

function downloadTemplate() {
  const blob = new Blob([generateCSVTemplate()], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employees_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ───────────────────────────────────────────────────────────

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
  const [csvImported, setCsvImported] = useState(false);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ── CSV Import ──────────────────────────────────────────────────────
  const handleCSVFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setCsvErrors(["Please upload a .csv file"]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows: parsed, errors } = parseCSV(text);

      if (parsed.length === 0) {
        setCsvErrors(errors.length > 0 ? errors : ["No valid employee rows found"]);
        return;
      }

      const newRows: EmployeeRow[] = parsed.map((p) => ({
        id: rowIdCounter++,
        ...p,
      }));

      setRows(newRows);
      setCsvImported(true);
      setCsvErrors(errors); // show partial errors if any
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleCSVFile(file);
    },
    [handleCSVFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCSVFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const clearCSVImport = () => {
    setRows([createEmptyRow()]);
    setCsvImported(false);
    setCsvErrors([]);
  };

  // Validation helpers
  const getDuplicate = (row: EmployeeRow) => {
    const addr = row.wallet.trim().toLowerCase();
    if (!addr.startsWith("0x")) return false;
    if (existingAddresses.some((a) => a.toLowerCase() === addr)) return true;
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

  // Check if only the default empty row exists (show CSV zone)
  const showCSVZone = step === "form" && !csvImported && rows.length === 1 && !rows[0].wallet && !rows[0].salary;

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
            {/* ── CSV Import Zone ─────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {showCSVZone && (
                <motion.div
                  key="csv-zone"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      group relative cursor-pointer rounded-xl border-2 border-dashed p-5
                      transition-all duration-300 overflow-hidden
                      ${isDragging
                        ? "border-[var(--accent)] bg-[rgba(0,229,160,0.06)]"
                        : "border-[var(--border)] hover:border-[rgba(0,229,160,0.3)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(0,229,160,0.02)]"
                      }
                    `}
                  >
                    {/* Subtle animated background shimmer on hover */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,229,160,0.04) 0%, transparent 70%)",
                      }}
                    />

                    <div className="relative flex flex-col items-center gap-3">
                      <motion.div
                        animate={isDragging ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`
                          flex h-10 w-10 items-center justify-center rounded-xl
                          transition-colors duration-300
                          ${isDragging
                            ? "bg-[rgba(0,229,160,0.15)]"
                            : "bg-[rgba(255,255,255,0.04)] group-hover:bg-[rgba(0,229,160,0.08)]"
                          }
                        `}
                      >
                        <FileSpreadsheet className={`h-5 w-5 transition-colors duration-300 ${isDragging ? "text-[var(--accent)]" : "text-[var(--text-muted)] group-hover:text-[var(--accent)]"}`} />
                      </motion.div>

                      <div className="text-center">
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          {isDragging ? (
                            <span className="text-[var(--accent)]">Drop CSV file here</span>
                          ) : (
                            <>
                              <span className="text-[var(--accent)]">Upload CSV</span>
                              {" "}or drag and drop
                            </>
                          )}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                          Format: name, role, wallet, salary
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate();
                        }}
                        className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        Download template
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative my-4 flex items-center">
                    <div className="flex-1 border-t border-[var(--border)]" />
                    <span className="px-3 text-[11px] text-[var(--text-muted)]">or add manually</span>
                    <div className="flex-1 border-t border-[var(--border)]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CSV Import Feedback ─────────────────────────────── */}
            <AnimatePresence>
              {csvImported && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="flex items-center justify-between rounded-lg bg-[rgba(0,229,160,0.06)] border border-[var(--border-accent)] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <span className="text-xs text-[var(--accent)] font-medium">
                        {rows.length} {rows.length === 1 ? "employee" : "employees"} imported from CSV
                      </span>
                    </div>
                    <button
                      onClick={clearCSVImport}
                      className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-0.5"
                      title="Clear import"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CSV parse warnings */}
            <AnimatePresence>
              {csvErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="rounded-lg bg-[rgba(239,68,68,0.06)] border border-red-500/20 px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-xs text-red-400 font-medium">
                          {csvImported ? "Some rows skipped" : "Import failed"}
                        </span>
                      </div>
                      <button
                        onClick={() => setCsvErrors([])}
                        className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {csvErrors.slice(0, 3).map((err, i) => (
                      <p key={i} className="text-[11px] text-red-400/70 pl-5.5">{err}</p>
                    ))}
                    {csvErrors.length > 3 && (
                      <p className="text-[11px] text-red-400/50 pl-5.5">
                        +{csvErrors.length - 3} more errors
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Employee Rows ────────────────────────────────────── */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {rows.map((row, idx) => {
                const isDup = getDuplicate(row);
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: csvImported ? idx * 0.03 : 0 }}
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

            {/* Add another + CSV re-import buttons */}
            {step === "form" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={addRow}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-2.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Employee
                </button>
                {!showCSVZone && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-2.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    CSV
                  </button>
                )}
              </div>
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

      {/* Hidden file input for CSV re-import after initial zone disappears */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileInput}
        className="hidden"
      />
    </Modal>
  );
}
