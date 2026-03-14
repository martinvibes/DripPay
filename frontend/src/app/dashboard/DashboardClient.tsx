"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useAccount, useReadContracts, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { OrgSelector } from "@/components/shared/OrgSelector";
import { CreateOrg } from "@/components/dashboard/CreateOrg";
import { useOrganizationFactory } from "@/hooks/useOrganization";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import type { Organization } from "@/lib/mock-data";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

type View = "connect" | "org-list" | "create-org";

export default function DashboardListPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const {
    createOrganization,
    organizations: orgAddresses,
    isCreating,
    txHash: createTxHash,
    isLoadingOrgs,
    refetchOrgs,
  } = useOrganizationFactory();

  const { isSuccess: isCreateConfirmed } = useWaitForTransactionReceipt({
    hash: createTxHash,
    query: { enabled: !!createTxHash },
  });

  const [handledTxHash, setHandledTxHash] = useState<string | null>(null);
  const [view, setView] = useState<View>("connect");

  // Batch-fetch real names for all org addresses
  const { data: orgNameResults, refetch: refetchOrgNames } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "name" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  const { data: orgCreatedAtResults, refetch: refetchOrgCreatedAt } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "createdAt" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  const { data: orgEmployeeResults, refetch: refetchOrgEmployees } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "getEmployees" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

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

  useEffect(() => {
    if (isCreateConfirmed && createTxHash && createTxHash !== handledTxHash) {
      setHandledTxHash(createTxHash);
      refetchOrgs();
      setView("org-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateConfirmed, createTxHash]);

  const prevOrgCountRef = useRef(orgAddresses?.length ?? 0);
  useEffect(() => {
    const currentCount = orgAddresses?.length ?? 0;
    if (currentCount > prevOrgCountRef.current) {
      refetchOrgNames();
      refetchOrgCreatedAt();
      refetchOrgEmployees();
    }
    prevOrgCountRef.current = currentCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgAddresses]);

  const handleSelectOrg = (org: Organization) => {
    const addr = (org as any).fullAddress || org.id;
    router.push(`/dashboard/${addr}`);
  };

  const handleCreateOrg = (name: string, paymentToken: `0x${string}`) => {
    createOrganization(name, paymentToken);
  };

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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {view === "connect" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full max-w-md"
            >
              <div className="accent-card overflow-hidden p-6 sm:p-8 text-center">
                <div className="mx-auto mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-[var(--accent)]" />
                </div>
                <h2
                  className="mb-2 text-xl sm:text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Employer Dashboard
                </h2>
                <p className="mb-6 sm:mb-8 text-xs sm:text-sm text-[var(--text-secondary)]">
                  Connect your wallet to manage organizations and payroll.
                </p>
                <WalletConnect />
              </div>
            </motion.div>
          </div>
        )}

        {view === "org-list" && (
          <OrgSelector
            key={`orgs-${orgs.length}-${orgs.map((o) => o.name).join(",")}`}
            title="Your Organizations"
            subtitle="Select an organization to manage or create a new one"
            isLoading={isLoadingOrgs}
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
      </div>
    </div>
  );
}
