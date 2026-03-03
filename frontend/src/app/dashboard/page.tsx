"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppNav } from "@/components/shared/AppNav";
import { CreateOrg } from "@/components/dashboard/CreateOrg";
import { StatCards } from "@/components/dashboard/StatCards";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { RunPayrollCard } from "@/components/dashboard/RunPayrollCard";
import { PayrollHistory } from "@/components/dashboard/PayrollHistory";
import { AddEmployeeModal } from "@/components/dashboard/AddEmployeeModal";
import { PayrollConfirmModal } from "@/components/dashboard/PayrollConfirmModal";
import { fadeUpSmall } from "@/lib/animations";

export default function DashboardPage() {
  const [orgName, setOrgName] = useState<string | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayrollConfirm, setShowPayrollConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <AppNav
        label="Employer Dashboard"
        altLink={{ href: "/employee", label: "Employee View" }}
      />

      {!orgName ? (
        <div className="mx-auto max-w-7xl px-6 py-8">
          <CreateOrg onOrgCreated={(name) => setOrgName(name)} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl px-6 py-8"
        >
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mb-8"
          >
            <motion.div
              variants={fadeUpSmall}
              custom={0}
              className="flex items-center gap-3 mb-1"
            >
              <Link
                href="/"
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1
                className="text-2xl font-bold tracking-tight md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Dashboard
              </h1>
            </motion.div>
            <motion.p
              variants={fadeUpSmall}
              custom={1}
              className="text-sm text-[var(--text-secondary)] ml-7"
            >
              Manage your organization&apos;s encrypted payroll
            </motion.p>
          </motion.div>

          <StatCards orgName={orgName} />

          <div className="grid gap-6 lg:grid-cols-3">
            <EmployeeTable onAddEmployee={() => setShowAddEmployee(true)} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <RunPayrollCard
                onExecute={() => setShowPayrollConfirm(true)}
              />
              <PayrollHistory />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddEmployee && (
          <AddEmployeeModal onClose={() => setShowAddEmployee(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayrollConfirm && (
          <PayrollConfirmModal
            onClose={() => setShowPayrollConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
