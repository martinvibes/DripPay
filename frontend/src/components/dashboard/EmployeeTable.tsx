"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Copy, Check, Users, Trash2, Loader2 } from "lucide-react";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import type { Employee } from "@/lib/mock-data";

interface EmployeeTableProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onRemoveEmployee?: (address: `0x${string}`) => void;
  isRemoving?: boolean;
}

export function EmployeeTable({ employees, onAddEmployee, onRemoveEmployee, isRemoving }: EmployeeTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="lg:col-span-2"
    >
      <div className="glass-card overflow-hidden !hover:transform-none">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] shrink-0">
              <Users className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Employees
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {employees.length} members &middot; Salaries encrypted
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !py-2 !pl-9 !pr-3 text-xs w-full sm:w-44"
              />
            </div>
            <button
              onClick={onAddEmployee}
              className="btn-primary !py-2 !px-4 text-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Mobile card layout */}
        <div className="sm:hidden divide-y divide-[var(--border)]">
          {filteredEmployees.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No employees found
            </div>
          ) : (
            filteredEmployees.map((emp, i) => (
              <MobileEmployeeCard
                key={emp.id}
                employee={emp}
                copied={copied}
                onCopy={handleCopy}
                onRemove={onRemoveEmployee}
                isRemoving={isRemoving}
                index={i}
              />
            ))
          )}
        </div>

        {/* Desktop table layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Wallet</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Salary</th>
                <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Last Paid</th>
                <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, i) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  copied={copied}
                  onCopy={handleCopy}
                  onRemove={onRemoveEmployee}
                  isRemoving={isRemoving}
                  index={i}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/** Mobile card view for each employee */
function MobileEmployeeCard({
  employee: emp,
  copied,
  onCopy,
  onRemove,
  isRemoving,
  index,
}: {
  employee: Employee;
  copied: string | null;
  onCopy: (text: string) => void;
  onRemove?: (address: `0x${string}`) => void;
  isRemoving?: boolean;
  index: number;
}) {
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04 }}
      className="flex items-start gap-3 px-4 py-3.5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent)] shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{emp.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                emp.status === "active"
                  ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)]"
                  : "bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]"
              }`}
            >
              <div
                className={`h-1 w-1 rounded-full ${
                  emp.status === "active" ? "bg-[var(--accent)]" : "bg-[var(--text-secondary)]"
                }`}
              />
              {emp.status}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(emp.fullAddress as `0x${string}`)}
                disabled={isRemoving}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
              >
                {isRemoving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{emp.role}</p>
        <div className="flex items-center justify-between mt-1.5">
          <button
            onClick={() => onCopy(emp.fullAddress)}
            className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {emp.address}
            {copied === emp.fullAddress ? (
              <Check className="h-2.5 w-2.5 text-[var(--accent)]" />
            ) : (
              <Copy className="h-2.5 w-2.5 opacity-40" />
            )}
          </button>
          <EncryptedValue />
        </div>
      </div>
    </motion.div>
  );
}

function EmployeeRow({
  employee: emp,
  copied,
  onCopy,
  onRemove,
  isRemoving,
  index,
}: {
  employee: Employee;
  copied: string | null;
  onCopy: (text: string) => void;
  onRemove?: (address: `0x${string}`) => void;
  isRemoving?: boolean;
  index: number;
}) {
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.05 }}
      className="table-row"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent)] shrink-0">
            {initials}
          </div>
          <span className="text-sm font-medium">{emp.name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">
        {emp.role}
      </td>
      <td className="px-5 py-3.5">
        <button
          onClick={() => onCopy(emp.fullAddress)}
          className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {emp.address}
          {copied === emp.fullAddress ? (
            <Check className="h-3 w-3 text-[var(--accent)]" />
          ) : (
            <Copy className="h-3 w-3 opacity-40" />
          )}
        </button>
      </td>
      <td className="px-5 py-3.5">
        <EncryptedValue />
      </td>
      <td className="hidden lg:table-cell px-5 py-3.5 text-sm text-[var(--text-muted)]">
        {emp.lastPaid}
      </td>
      <td className="hidden md:table-cell px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            emp.status === "active"
              ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)]"
              : "bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              emp.status === "active" ? "bg-[var(--accent)]" : "bg-[var(--text-secondary)]"
            }`}
          />
          {emp.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {onRemove && (
          <button
            onClick={() => onRemove(emp.fullAddress as `0x${string}`)}
            disabled={isRemoving}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
            title="Remove employee"
          >
            {isRemoving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </td>
    </motion.tr>
  );
}
