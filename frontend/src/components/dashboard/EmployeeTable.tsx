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
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
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
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !py-2 !pl-9 !pr-3 text-xs w-44"
              />
            </div>
            <button
              onClick={onAddEmployee}
              className="btn-primary !py-2 !px-4 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Employee", "Role", "Wallet", "Salary", "Last Paid", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                    >
                      {h}
                    </th>
                  )
                )}
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent)]">
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
      <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">
        {emp.lastPaid}
      </td>
      <td className="px-5 py-3.5">
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
