"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Copy, Check } from "lucide-react";
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
import { DepositCard } from "@/components/dashboard/DepositCard";
import {
  useOrganizationFactory,
  useOrganization,
} from "@/hooks/useOrganization";
import { useERC20 } from "@/hooks/useERC20";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import type { Organization, Employee } from "@/lib/mock-data";
import { fadeUpSmall } from "@/lib/animations";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

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
    paymentToken,
    contractBalance,
    createdAt,
    isETH,
    deposit,
    removeEmployee,
    isPending,
    refetchEmployees,
    refetchBalance,
  } = useOrganization(selectedOrgAddress ?? undefined);

  // Fetch token metadata for ERC-20 orgs
  const {
    symbol: tokenSymbol,
    decimals: tokenDecimals,
  } = useERC20(
    !isETH && paymentToken ? paymentToken : undefined,
    selectedOrgAddress ?? undefined,
  );

  const displaySymbol = isETH ? "ETH" : tokenSymbol || "TOKEN";
  const displayDecimals = isETH ? 18 : tokenDecimals ?? 18;

  // Batch-fetch real names for all org addresses
  const { data: orgNameResults } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "name" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  // Batch-fetch createdAt for all org addresses
  const { data: orgCreatedAtResults } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "createdAt" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  // Batch-fetch employee lists for all org addresses
  const { data: orgEmployeeResults } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "getEmployees" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  // Build Organization objects from on-chain addresses + fetched names
  const orgs: Organization[] = (orgAddresses ?? []).map((addr, i) => {
    const nameResult = orgNameResults?.[i];
    const fetchedName =
      nameResult?.status === "success" ? (nameResult.result as string) : "";

    const createdAtResult = orgCreatedAtResults?.[i];
    const createdTimestamp =
      createdAtResult?.status === "success" ? (createdAtResult.result as bigint) : undefined;

    const createdDate = createdTimestamp
      ? new Date(Number(createdTimestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";

    const empResult = orgEmployeeResults?.[i];
    const empCount =
      empResult?.status === "success" ? (empResult.result as string[]).length : 0;

    return {
      id: addr,
      name: fetchedName || `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      address: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      fullAddress: addr,
      employeeCount: empCount,
      lastPayroll: createdDate,
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

  const handleCreateOrg = (name: string, paymentToken: `0x${string}`) => {
    createOrganization(name, paymentToken);
  };

  const handleBack = () => {
    setSelectedOrgAddress(null);
    setView("org-list");
  };

  // Employee metadata stored in localStorage (names/roles aren't on-chain)
  const getEmployeeMeta = (orgAddr: string, empAddr: string) => {
    if (typeof window === "undefined") return null;
    try {
      const key = `drippay_emp_${orgAddr}_${empAddr}`.toLowerCase();
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const saveEmployeeMeta = (orgAddr: string, empAddr: string, meta: { name: string; role: string }) => {
    if (typeof window === "undefined") return;
    const key = `drippay_emp_${orgAddr}_${empAddr}`.toLowerCase();
    localStorage.setItem(key, JSON.stringify(meta));
  };

  const employees: Employee[] = (contractEmployees ?? []).map((addr, i) => {
    const meta = selectedOrgAddress ? getEmployeeMeta(selectedOrgAddress, addr) : null;
    return {
      id: i + 1,
      name: meta?.name || `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      address: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      fullAddress: addr,
      role: meta?.role || "Employee",
      status: "active",
      lastPaid: "—",
    };
  });

  // Format createdAt for the dashboard header
  const orgCreatedDate = createdAt
    ? new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

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
                        {orgCreatedDate ? `Created ${orgCreatedDate} · ` : ""}
                        Paying in {displaySymbol}
                      </p>
                      <CopyOrgAddress address={selectedOrgAddress} />
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
              contractBalance={contractBalance}
              isETH={isETH}
              tokenSymbol={displaySymbol}
              tokenDecimals={displayDecimals}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <EmployeeTable
                employees={employees}
                onAddEmployee={() => setShowAddEmployee(true)}
                onRemoveEmployee={(addr) => {
                  removeEmployee(addr);
                  setTimeout(() => refetchEmployees(), 2000);
                }}
                isRemoving={isPending}
              />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-6"
              >
                <DepositCard
                  orgAddress={selectedOrgAddress}
                  isETH={isETH}
                  paymentToken={paymentToken}
                  contractBalance={contractBalance}
                  tokenSymbol={displaySymbol}
                  tokenDecimals={displayDecimals}
                  onDeposit={deposit}
                  isPending={isPending}
                  refetchBalance={refetchBalance}
                />
                <RunPayrollCard
                  onExecute={() => setShowPayrollConfirm(true)}
                  activeCount={employees.length}
                />
                <PayrollHistory
                  orgAddress={selectedOrgAddress}
                  tokenSymbol={displaySymbol}
                  tokenDecimals={displayDecimals}
                />
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
            onAddEmployee={(info) => {
              if (info && selectedOrgAddress) {
                saveEmployeeMeta(selectedOrgAddress, info.wallet, {
                  name: info.name,
                  role: info.role,
                });
              }
              refetchEmployees();
              setShowAddEmployee(false);
            }}
            orgAddress={selectedOrgAddress}
            existingCount={employees.length}
            tokenSymbol={displaySymbol}
            tokenDecimals={displayDecimals}
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

/** Copyable org contract address — share with employees */
function CopyOrgAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-mono"
      title="Copy contract address — share with employees"
    >
      <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
      {copied ? (
        <Check className="h-3 w-3 text-[var(--accent)]" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied && <span className="text-[var(--accent)] font-sans">Copied!</span>}
    </button>
  );
}
