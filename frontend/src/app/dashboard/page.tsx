"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { AppNav } from "@/components/shared/AppNav";
import { OrgSelector } from "@/components/shared/OrgSelector";
import { CreateOrg } from "@/components/dashboard/CreateOrg";
import { StatCards } from "@/components/dashboard/StatCards";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { RunPayrollCard } from "@/components/dashboard/RunPayrollCard";
import { PayrollHistory } from "@/components/dashboard/PayrollHistory";
import { AddEmployeeModal } from "@/components/dashboard/AddEmployeeModal";
import { PayrollConfirmModal } from "@/components/dashboard/PayrollConfirmModal";
import { mockEmployerOrgs, mockEmployees } from "@/lib/mock-data";
import type { Organization, Employee } from "@/lib/mock-data";
import { fadeUpSmall } from "@/lib/animations";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

type View = "org-list" | "create-org" | "dashboard";

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Organization[]>(mockEmployerOrgs);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [view, setView] = useState<View>("org-list");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayrollConfirm, setShowPayrollConfirm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  const activeEmployees = employees.filter((e) => e.status === "active");

  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    setView("dashboard");
  };

  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => [...prev, emp]);
    // Update org employee count
    if (selectedOrg) {
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === selectedOrg.id
            ? { ...o, employeeCount: o.employeeCount + 1 }
            : o
        )
      );
      setSelectedOrg((prev) =>
        prev ? { ...prev, employeeCount: prev.employeeCount + 1 } : prev
      );
    }
  };

  const handlePayrollExecuted = () => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    // Update last paid for active employees
    setEmployees((prev) =>
      prev.map((e) =>
        e.status === "active" ? { ...e, lastPaid: today } : e
      )
    );
    // Update org last payroll
    if (selectedOrg) {
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === selectedOrg.id ? { ...o, lastPayroll: today } : o
        )
      );
      setSelectedOrg((prev) => (prev ? { ...prev, lastPayroll: today } : prev));
    }
  };

  const handleCreateOrg = (name: string) => {
    const newOrg: Organization = {
      id: Date.now().toString(),
      name,
      address: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      employeeCount: 0,
      lastPayroll: "—",
      role: "admin",
    };
    setOrgs((prev) => [...prev, newOrg]);
    setSelectedOrg(newOrg);
    setView("dashboard");
  };

  const handleBack = () => {
    setSelectedOrg(null);
    setView("org-list");
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute top-0 right-0 w-[800px] h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 10%, rgba(0,229,160,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 90%, rgba(0,229,160,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Scattered decorative stars — large and visible */}
      <Star4 className="top-24 right-[7%]" size={32} opacity={0.14} pulse delay={0.5} />
      <Star4 className="top-[20%] left-[3%]" size={38} opacity={0.15} pulse delay={0} />
      <Star4 className="top-[38%] left-[2%]" size={28} opacity={0.12} rotate delay={1} />
      <Star4 className="top-[14%] right-[14%]" size={24} opacity={0.11} rotate delay={1.8} />
      <Star4 className="top-[48%] right-[5%]" size={36} opacity={0.13} pulse delay={0.3} />
      <Star4 className="top-[62%] left-[6%]" size={30} opacity={0.12} rotate delay={2.2} />
      <Star4 className="bottom-[18%] right-[9%]" size={28} opacity={0.13} pulse delay={1.2} />
      <Star4 className="bottom-[8%] left-[12%]" size={22} opacity={0.1} rotate delay={0.7} />
      <Star4 className="top-[33%] right-[18%]" size={20} opacity={0.09} pulse delay={2.5} />
      <Star4 className="bottom-[28%] left-[1%]" size={34} opacity={0.12} pulse delay={1.6} />
      <Star4 className="top-[72%] right-[16%]" size={26} opacity={0.1} rotate delay={0.9} />
      <Star4 className="top-[55%] right-[22%]" size={18} opacity={0.08} pulse delay={3} />
      <Star4 className="top-[80%] left-[20%]" size={24} opacity={0.09} rotate delay={1.4} />
      <CrossMark className="top-[28%] right-[4%]" size={16} opacity={0.09} rotate delay={2} />
      <CrossMark className="top-[58%] left-[10%]" size={14} opacity={0.08} rotate delay={0.4} />
      <CrossMark className="bottom-[22%] right-[13%]" size={14} opacity={0.07} delay={1.3} />
      <Diamond className="top-[52%] left-[5%]" size={12} opacity={0.12} float delay={0.8} />
      <Diamond className="bottom-[18%] right-[3%]" size={14} opacity={0.12} pulse delay={1.5} />
      <Diamond className="top-[16%] left-[16%]" size={10} opacity={0.1} float delay={2} />
      <Diamond className="top-[42%] right-[2%]" size={12} opacity={0.09} pulse delay={0.6} />
      <Dot className="top-[23%] left-[9%]" size={5} opacity={0.2} pulse delay={0.3} />
      <Dot className="bottom-[32%] right-[10%]" size={5} opacity={0.18} pulse delay={1.8} />
      <Dot className="top-[36%] left-[18%]" size={4} opacity={0.18} pulse delay={1.1} />
      <Dot className="top-[68%] right-[7%]" size={5} opacity={0.16} pulse delay={0.5} />
      <Dot className="bottom-[10%] left-[6%]" size={5} opacity={0.15} pulse delay={2.3} />
      <Dot className="top-[10%] right-[23%]" size={4} opacity={0.19} pulse delay={0.2} />

      <AppNav
        label="Employer Dashboard"
        altLink={{ href: "/employee", label: "Employee View" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {view === "org-list" && (
          <OrgSelector
            title="Your Organizations"
            subtitle="Select an organization to manage or create a new one"
            orgs={orgs}
            onSelect={handleSelectOrg}
            onCreateNew={() => setView("create-org")}
          />
        )}

        {view === "create-org" && (
          <div className="py-8">
            <button
              onClick={() => setView("org-list")}
              className="mb-4 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to organizations
            </button>
            <CreateOrg onOrgCreated={handleCreateOrg} />
          </div>
        )}

        {view === "dashboard" && selectedOrg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="py-8"
          >
            {/* Dashboard header banner */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="mb-8"
            >
              <motion.div
                variants={fadeUpSmall}
                custom={0}
                className="accent-card overflow-hidden px-6 py-5 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBack}
                      className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <h1
                        className="text-2xl font-bold tracking-tight md:text-3xl"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {selectedOrg.name}
                      </h1>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        Manage your organization&apos;s encrypted payroll
                      </p>
                    </div>
                  </div>

                  {/* Live status indicators */}
                  <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      />
                      <span className="text-xs text-[var(--text-secondary)]">Sepolia</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-3 py-1.5">
                      <Shield className="h-3 w-3 text-[var(--accent)]" />
                      <span className="text-xs font-medium text-[var(--accent)]">FHE Active</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <StatCards
              orgName={selectedOrg.name}
              employeeCount={employees.length}
              activeCount={activeEmployees.length}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <EmployeeTable
                employees={employees}
                onAddEmployee={() => setShowAddEmployee(true)}
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-6"
              >
                <RunPayrollCard
                  onExecute={() => setShowPayrollConfirm(true)}
                  activeCount={activeEmployees.length}
                />
                <PayrollHistory />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddEmployee && (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAddEmployee={handleAddEmployee}
            existingCount={employees.length}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayrollConfirm && (
          <PayrollConfirmModal
            onClose={() => setShowPayrollConfirm(false)}
            onExecute={handlePayrollExecuted}
            employees={employees}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
