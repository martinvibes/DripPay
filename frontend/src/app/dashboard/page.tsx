"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useAccount, useReadContracts, useWaitForTransactionReceipt } from "wagmi";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { OrgSelector } from "@/components/shared/OrgSelector";
import { CreateOrg } from "@/components/dashboard/CreateOrg";
import { StatCards } from "@/components/dashboard/StatCards";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { RunPayrollCard } from "@/components/dashboard/RunPayrollCard";
import { PayrollHistory } from "@/components/dashboard/PayrollHistory";
import { AddEmployeeModal } from "@/components/dashboard/AddEmployeeModal";
import { PayrollConfirmModal } from "@/components/dashboard/PayrollConfirmModal";
import {
  useOrganizationFactory,
  useOrganization,
} from "@/hooks/useOrganization";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import type { Organization, Employee } from "@/lib/mock-data";
import { fadeUpSmall } from "@/lib/animations";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

type View = "connect" | "org-list" | "create-org" | "dashboard";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const {
    createOrganization,
    organizations: orgAddresses,
    isCreating,
    txHash: createTxHash,
    isLoadingOrgs,
    refetchOrgs,
  } = useOrganizationFactory();

  // Wait for the create-org tx to actually confirm on-chain before refetching
  const { isSuccess: isCreateConfirmed } = useWaitForTransactionReceipt({
    hash: createTxHash,
    query: { enabled: !!createTxHash },
  });

  // Track which tx hash we've already handled, to avoid re-triggering
  const [handledTxHash, setHandledTxHash] = useState<string | null>(null);

  const [selectedOrgAddress, setSelectedOrgAddress] =
    useState<`0x${string}` | null>(null);
  const [view, setView] = useState<View>("connect");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayrollConfirm, setShowPayrollConfirm] = useState(false);

  const {
    orgName,
    employees: contractEmployees,
    refetchEmployees,
  } = useOrganization(selectedOrgAddress ?? undefined);

  // Batch-fetch real names for all org addresses
  const { data: orgNameResults } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "name" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  // Build Organization objects from on-chain addresses + fetched names
  const orgs: Organization[] = (orgAddresses ?? []).map((addr, i) => {
    const nameResult = orgNameResults?.[i];
    const fetchedName =
      nameResult?.status === "success" ? (nameResult.result as string) : "";
    return {
      id: addr,
      name: fetchedName || `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      address: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      fullAddress: addr,
      employeeCount: 0,
      lastPayroll: "—",
      role: "admin" as const,
    };
  });

  useEffect(() => {
    if (!isConnected) {
      setView("connect");
    } else if (view === "connect") {
      setView("org-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // Only refetch after tx is confirmed on-chain (not just submitted)
  useEffect(() => {
    if (isCreateConfirmed && createTxHash && createTxHash !== handledTxHash) {
      setHandledTxHash(createTxHash);
      refetchOrgs();
      setView("org-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateConfirmed, createTxHash]);

  const handleSelectOrg = (org: Organization) => {
    const addr = (org as any).fullAddress || org.id;
    setSelectedOrgAddress(addr as `0x${string}`);
    setView("dashboard");
  };

  const handleCreateOrg = (name: string) => {
    createOrganization(name);
  };

  const handleBack = () => {
    setSelectedOrgAddress(null);
    setView("org-list");
  };

  const employees: Employee[] = (contractEmployees ?? []).map((addr, i) => ({
    id: i + 1,
    name: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
    address: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
    fullAddress: addr,
    role: "Employee",
    status: "active",
    lastPaid: "—",
  }));

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
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

      <Star4 className="top-24 right-[7%]" size={32} opacity={0.14} pulse delay={0.5} />
      <Star4 className="top-[20%] left-[3%]" size={38} opacity={0.15} pulse delay={0} />
      <CrossMark className="top-[28%] right-[4%]" size={16} opacity={0.09} rotate delay={2} />
      <Diamond className="top-[52%] left-[5%]" size={12} opacity={0.12} float delay={0.8} />
      <Dot className="top-[23%] left-[9%]" size={5} opacity={0.2} pulse delay={0.3} />

      <AppNav
        label="Employer Dashboard"
        altLink={{ href: "/employee", label: "Employee View" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {view === "connect" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full max-w-md"
            >
              <div className="accent-card overflow-hidden p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                  <Shield className="h-8 w-8 text-[var(--accent)]" />
                </div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Employer Dashboard
                </h2>
                <p className="mb-8 text-sm text-[var(--text-secondary)]">
                  Connect your wallet to manage organizations and payroll.
                </p>
                <WalletConnect />
              </div>
            </motion.div>
          </div>
        )}

        {view === "org-list" && (
          <OrgSelector
            title="Your Organizations"
            subtitle={
              isLoadingOrgs
                ? "Loading organizations from contract..."
                : "Select an organization to manage or create a new one"
            }
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
            <CreateOrg
              onOrgCreated={handleCreateOrg}
              isDeploying={isCreating || (!!createTxHash && createTxHash !== handledTxHash && !isCreateConfirmed)}
            />
          </div>
        )}

        {view === "dashboard" && selectedOrgAddress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="py-8"
          >
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
                        {orgName || `${selectedOrgAddress.slice(0, 6)}...${selectedOrgAddress.slice(-4)}`}
                      </h1>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        Manage your organization&apos;s encrypted payroll
                      </p>
                    </div>
                  </div>
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
              orgName={orgName || "Organization"}
              employeeCount={employees.length}
              activeCount={employees.length}
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
                  activeCount={employees.length}
                />
                <PayrollHistory />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddEmployee && selectedOrgAddress && (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAddEmployee={() => {
              refetchEmployees();
              setShowAddEmployee(false);
            }}
            orgAddress={selectedOrgAddress}
            existingCount={employees.length}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayrollConfirm && selectedOrgAddress && (
          <PayrollConfirmModal
            onClose={() => setShowPayrollConfirm(false)}
            onExecute={() => {
              refetchEmployees();
            }}
            orgAddress={selectedOrgAddress}
            employees={employees}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
