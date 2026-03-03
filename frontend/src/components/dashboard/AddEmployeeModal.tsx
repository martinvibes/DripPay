"use client";

import { Shield, Lock } from "lucide-react";
import { Modal } from "@/components/shared/Modal";

interface AddEmployeeModalProps {
  onClose: () => void;
}

export function AddEmployeeModal({ onClose }: AddEmployeeModalProps) {
  return (
    <Modal onClose={onClose} title="Add Employee">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
            Employee Name
          </label>
          <input
            type="text"
            placeholder="Enter name"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
            Wallet Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="input-field font-mono"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
            Role
          </label>
          <input
            type="text"
            placeholder="e.g. Engineer, Designer"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
            Monthly Salary (will be encrypted)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="Amount in tokens"
              className="input-field !pr-20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Lock className="h-3 w-3" />
              <span>FHE</span>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            This amount will be encrypted before being stored onchain. No one
            can see it except the employee.
          </p>
        </div>
        <button className="btn-primary w-full !py-3 mt-2">
          <Shield className="h-4 w-4" />
          Encrypt & Add Employee
        </button>
      </div>
    </Modal>
  );
}
