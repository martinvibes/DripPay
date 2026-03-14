"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Fingerprint, Search, Loader2 } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { useEmployeeOrganizations } from "@/hooks/useOrganization";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import {
  Hexagon,
  Ring,
  ShieldShape,
  KeyHole,
  BinaryBlock,
  Dot,
} from "@/components/shared/Stars";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const LOCALSTORAGE_KEY = "drippay_employee_orgs";

function getSavedOrgs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrg(addr: string) {
  if (typeof window === "undefined") return;
  const existing = getSavedOrgs();
  const lower = addr.toLowerCase();
  if (!existing.some((a) => a.toLowerCase() === lower)) {
    existing.push(addr);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(existing));
  }
}

export default function EmployeeListPage() {
  const { isConnected, address: connectedAddress } = useAccount();
  const router = useRouter();
  const [orgInput, setOrgInput] = useState("");
  const [savedOrgs, setSavedOrgs] = useState<string[]>([]);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { employeeOrgs, isLoadingEmployeeOrgs } = useEmployeeOrganizations();

  useEffect(() => {
    setSavedOrgs(getSavedOrgs());
  }, []);

  useEffect(() => {
    if (employeeOrgs.length > 0) {
      for (const addr of employeeOrgs) {
        saveOrg(addr);
      }
      setSavedOrgs(getSavedOrgs());
    }
  }, [employeeOrgs]);

  const orgToVerify = orgInput.trim() as `0x${string}`;
  const { data: isEmployeeResult, isLoading: isCheckingEmployee } = useReadContract({
    address: orgToVerify.startsWith("0x") && orgToVerify.length === 42 ? orgToVerify : undefined,
    abi: ORGANIZATION_ABI,
    functionName: "isEmployee",
    args: connectedAddress ? [connectedAddress] : undefined,
    query: {
      enabled: !!connectedAddress && orgToVerify.startsWith("0x") && orgToVerify.length === 42 && isVerifying,
    },
  });

  useEffect(() => {
    if (isVerifying && isEmployeeResult !== undefined) {
      setIsVerifying(false);
      if (isEmployeeResult) {
        const addr = orgInput.trim();
        saveOrg(addr);
        setSavedOrgs(getSavedOrgs());
        router.push(`/employee/${addr}`);
        setOrgInput("");
        setVerifyError("");
      } else {
        setVerifyError("You are not an employee of this organization.");
      }
    }
  }, [isEmployeeResult, isVerifying, orgInput, router]);

  const handleVerifyOrg = () => {
    const addr = orgInput.trim();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setVerifyError("Please enter a valid contract address (0x...).");
      return;
    }
    setVerifyError("");
    setIsVerifying(true);
  };

  const view = !isConnected ? "connect" : "org-list";

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
          style={{
            background: "radial-gradient(ellipse 50% 45% at 50% 40%, rgba(0,229,160,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <Hexagon className="top-28 left-[4%]" size={44} opacity={0.1} rotate delay={0} />
      <Hexagon className="top-[35%] right-[3%]" size={52} opacity={0.08} pulse delay={1.5} />
      <Ring className="top-[15%] right-[6%]" size={56} opacity={0.08} pulse delay={0.3} />
      <ShieldShape className="top-[22%] left-[8%]" size={30} opacity={0.1} float delay={0.5} />
      <KeyHole className="top-[30%] right-[12%]" size={22} opacity={0.09} pulse delay={1.5} />
      <BinaryBlock className="top-[20%] left-[15%]" opacity={0.05} delay={1} />
      <Dot className="top-[25%] right-[22%]" size={4} opacity={0.18} pulse delay={0.3} />
      <Dot className="top-[42%] left-[12%]" size={5} opacity={0.15} pulse delay={1.5} />

      <AppNav
        label="Employee Portal"
        altLink={{ href: "/dashboard", label: "Employer View" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        {view === "connect" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full max-w-md"
            >
              <div className="accent-card overflow-hidden p-6 sm:p-8 text-center">
                <div className="relative mx-auto mb-6 h-20 w-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[var(--border-accent)] opacity-30"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border border-dashed border-[var(--border-accent)] opacity-20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                      <Shield className="h-7 w-7 text-[var(--accent)]" />
                    </div>
                  </div>
                </div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  View Your Balance
                </h2>
                <p className="mb-6 sm:mb-8 text-xs sm:text-sm text-[var(--text-secondary)]">
                  Connect your wallet to see the organizations you belong to and decrypt your balance.
                </p>
                <WalletConnect />
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    FHE Encrypted
                  </span>
                  <span className="h-3 w-px bg-[var(--border)]" />
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="h-3 w-3" />
                    Wallet-signed
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {view === "org-list" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-5 sm:mb-8">
                <h1
                  className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-2 sm:mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Organizations
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {savedOrgs.length > 0
                    ? "Select an organization to view your balance"
                    : "Organizations you belong to will appear here automatically"}
                </p>
              </div>

              {isLoadingEmployeeOrgs && savedOrgs.length === 0 && (
                <div className="accent-card overflow-hidden p-6 text-center mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">Checking for organizations...</p>
                </div>
              )}

              {savedOrgs.length > 0 && (
                <div className="space-y-2 mb-4">
                  {savedOrgs.map((addr) => (
                    <SavedOrgCard
                      key={addr}
                      orgAddress={addr as `0x${string}`}
                      onClick={() => router.push(`/employee/${addr}`)}
                    />
                  ))}
                </div>
              )}

              <div className="accent-card overflow-hidden p-4 sm:p-6">
                <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                  Join by Contract Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={orgInput}
                    onChange={(e) => {
                      setOrgInput(e.target.value);
                      setVerifyError("");
                      setIsVerifying(false);
                    }}
                    className="input-field flex-1 font-mono text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerifyOrg();
                    }}
                  />
                  <button
                    onClick={handleVerifyOrg}
                    disabled={isVerifying || isCheckingEmployee}
                    className="btn-primary !px-5 shrink-0 disabled:opacity-50"
                  >
                    {isVerifying || isCheckingEmployee ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span>{isVerifying || isCheckingEmployee ? "Checking..." : "Join"}</span>
                  </button>
                </div>
                {verifyError && (
                  <p className="mt-2 text-xs text-red-400">{verifyError}</p>
                )}
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                  Can&apos;t see your organization? Ask your employer for the contract address.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedOrgCard({ orgAddress, onClick }: { orgAddress: `0x${string}`; onClick: () => void }) {
  const { data: name } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "name",
    query: { enabled: true },
  });

  const { data: paymentTokenAddr } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "paymentToken",
    query: { enabled: true },
  });

  const isETH = !paymentTokenAddr || paymentTokenAddr === ZERO_ADDRESS;
  const displayName = (name as string) || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`;

  return (
    <button
      onClick={onClick}
      className="w-full accent-card overflow-hidden p-4 text-left hover:border-[var(--border-accent)] transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
            {displayName}
          </p>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            {orgAddress.slice(0, 6)}...{orgAddress.slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">{isETH ? "ETH" : "ERC-20"}</span>
          <ArrowLeft className="h-3 w-3 text-[var(--text-muted)] rotate-180" />
        </div>
      </div>
    </button>
  );
}
