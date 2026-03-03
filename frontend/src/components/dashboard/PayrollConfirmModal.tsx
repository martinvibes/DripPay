"use client";

import { Zap, Lock } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import { mockEmployees } from "@/lib/mock-data";

interface PayrollConfirmModalProps {
  onClose: () => void;
}

export function PayrollConfirmModal({ onClose }: PayrollConfirmModalProps) {
  const activeEmployees = mockEmployees.filter((e) => e.status === "active");

  return (
    <Modal onClose={onClose} title="Confirm Payroll Execution">
      <div className="space-y-4">
        <div className="rounded-xl bg-[rgba(0,229,160,0.05)] border border-[var(--border-accent)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">
            You are about to execute encrypted batch payroll for{" "}
            <span className="font-bold text-[var(--text-primary)]">
              {activeEmployees.length} active employees
            </span>
            . All salary amounts will remain encrypted throughout the
            transaction.
          </p>
        </div>

        <div className="space-y-2">
          {activeEmployees.map((emp) => {
            const initials = emp.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={emp.id}
                className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[10px] font-bold text-[var(--accent)]">
                    {initials}
                  </div>
                  <span className="text-sm">{emp.name}</span>
                </div>
                <EncryptedValue bars={4} barHeight="h-2.5" />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 !py-3">
            Cancel
          </button>
          <button onClick={onClose} className="btn-primary flex-1 !py-3">
            <Zap className="h-4 w-4" />
            Confirm & Execute
          </button>
        </div>
      </div>
    </Modal>
  );
}
