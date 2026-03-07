"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Fingerprint, Search, Loader2 } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { BalanceCard } from "@/components/employee/BalanceCard";
import { TransactionHistory } from "@/components/employee/TransactionHistory";
import { WithdrawCard } from "@/components/employee/WithdrawCard";
import { PrivacyInfo } from "@/components/employee/PrivacyInfo";
import { OrgInfo } from "@/components/employee/OrgInfo";
import { useOrganization } from "@/hooks/useOrganization";
import { useERC20 } from "@/hooks/useERC20";
import { useFhevm } from "@/hooks/useFhevm";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { fadeUpSmall } from "@/lib/animations";
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

type View = "connect" | "org-list" | "balance";

/** Load saved org addresses from localStorage */
function getSavedOrgs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save an org address to localStorage */
function saveOrg(addr: string) {
  if (typeof window === "undefined") return;
  const existing = getSavedOrgs();
  const lower = addr.toLowerCase();
  if (!existing.some((a) => a.toLowerCase() === lower)) {
    existing.push(addr);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(existing));
  }
}

export default function EmployeePage() {
  const { isConnected, address: connectedAddress } = useAccount();
  const [selectedOrgAddress, setSelectedOrgAddress] = useState<`0x${string}` | null>(null);
  const [orgInput, setOrgInput] = useState("");
  const [savedOrgs, setSavedOrgs] = useState<string[]>([]);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Balance decryption state
  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState("");

  const { decryptBalance } = useFhevm();

  // Load saved orgs on mount
  useEffect(() => {
    setSavedOrgs(getSavedOrgs());
  }, []);

  // Read org data for selected org
  const {
    orgName,
    paymentToken,
    createdAt,
    isETH,
    refetchBalance,
  } = useOrganization(selectedOrgAddress ?? undefined);

  // Check isEmployee for the input address
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

  // Get balance handle for decryption
  const { data: balanceHandle, refetch: refetchHandle } = useReadContract({
    address: selectedOrgAddress ?? undefined,
    abi: ORGANIZATION_ABI,
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress] : undefined,
    query: { enabled: !!selectedOrgAddress && !!connectedAddress },
  });

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

  // Batch-check saved orgs for employee membership
  // We'll do individual isEmployee checks for each saved org
  // For simplicity, read org names for the saved list

  const view: View = !isConnected
    ? "connect"
    : !selectedOrgAddress
      ? "org-list"
      : "balance";

  // Handle verification result
  useEffect(() => {
    if (isVerifying && isEmployeeResult !== undefined) {
      setIsVerifying(false);
      if (isEmployeeResult) {
        const addr = orgInput.trim() as `0x${string}`;
        saveOrg(addr);
        setSavedOrgs(getSavedOrgs());
        setSelectedOrgAddress(addr);
        setOrgInput("");
        setVerifyError("");
      } else {
        setVerifyError("You are not an employee of this organization.");
      }
    }
  }, [isEmployeeResult, isVerifying]);

  const handleVerifyOrg = () => {
    const addr = orgInput.trim();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setVerifyError("Please enter a valid contract address (0x...).");
      return;
    }
    setVerifyError("");
    setIsVerifying(true);
  };

  const handleSelectSavedOrg = (addr: string) => {
    setSelectedOrgAddress(addr as `0x${string}`);
  };

  const handleBack = () => {
    setSelectedOrgAddress(null);
    setIsBalanceRevealed(false);
    setDecryptedBalance(null);
    setDecryptError("");
  };

  /** Attempt a single decryption of the balance handle */
  const attemptDecrypt = async (handleHex: `0x${string}`): Promise<bigint | boolean | `0x${string}`> => {
    if (!selectedOrgAddress) throw new Error("No org selected");
    console.log("[Decrypt] Attempting decrypt for handle:", handleHex);
    const result = await decryptBalance(handleHex, selectedOrgAddress);
    console.log("[Decrypt] Result:", result, "type:", typeof result);
    return result;
  };

  const handleRevealBalance = async () => {
    if (isBalanceRevealed) {
      setIsBalanceRevealed(false);
      setDecryptedBalance(null);
      return;
    }

    if (!selectedOrgAddress || !connectedAddress) return;

    setIsDecrypting(true);
    setDecryptError("");

    try {
      // Always refetch the handle to get the latest on-chain value
      const { data: freshHandle } = await refetchHandle();
      const handle = (freshHandle ?? balanceHandle) as `0x${string}`;
      console.log("[Decrypt] Handle from contract:", handle);

      if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        console.log("[Decrypt] Handle is zero/empty, no balance set");
        setDecryptedBalance("0.000000");
        setIsBalanceRevealed(true);
        setIsDecrypting(false);
        return;
      }

      // Pass handle directly as hex string (matching Zama's official pattern)
      let result = await attemptDecrypt(handle);

      // If result is 0, the FHE coprocessor computation may not have settled yet.
      // Retry once after a short delay.
      if (result === BigInt(0)) {
        console.log("[Decrypt] Got 0 — retrying in 5s (FHE coprocessor may still be computing)...");
        setDecryptError("FHE computation may still be processing. Retrying...");
        await new Promise(r => setTimeout(r, 5000));
        result = await attemptDecrypt(handle);
      }

      // Convert from smallest unit (wei) back to human-readable
      const raw = typeof result === "bigint" ? result : BigInt(String(result));
      console.log("[Decrypt] Raw decrypted value (smallest unit):", raw.toString());
      const humanReadable = formatUnits(raw, displayDecimals);
      console.log("[Decrypt] Human-readable:", humanReadable, displaySymbol);
      // Format with appropriate decimal places
      const num = parseFloat(humanReadable);
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      });
      setDecryptedBalance(formatted);
      setDecryptError("");
      setIsBalanceRevealed(true);
    } catch (err: any) {
      console.error("[Decrypt] Error:", err);
      setDecryptError(err?.message || "Failed to decrypt balance");
      setDecryptedBalance(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  // Format createdAt
  const orgCreatedDate = createdAt
    ? new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
          style={{
            background:
              "radial-gradient(ellipse 50% 45% at 50% 40%, rgba(0,229,160,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-[500px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 15% 15%, rgba(0,229,160,0.025) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 85% 85%, rgba(0,229,160,0.025) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Decorative elements */}
      <Hexagon className="top-28 left-[4%]" size={44} opacity={0.1} rotate delay={0} />
      <Hexagon className="top-[35%] right-[3%]" size={52} opacity={0.08} pulse delay={1.5} />
      <Hexagon className="bottom-[20%] left-[6%]" size={36} opacity={0.09} rotate delay={0.8} />
      <Hexagon className="top-[60%] right-[8%]" size={40} opacity={0.07} pulse delay={2.2} />
      <Hexagon className="top-[18%] right-[18%]" size={28} opacity={0.06} rotate delay={3} />
      <Hexagon className="bottom-[35%] left-[15%]" size={32} opacity={0.07} pulse delay={1} />

      <Ring className="top-[15%] right-[6%]" size={56} opacity={0.08} pulse delay={0.3} />
      <Ring className="top-[45%] left-[2%]" size={48} opacity={0.07} pulse delay={1.8} />
      <Ring className="bottom-[12%] right-[10%]" size={44} opacity={0.06} pulse delay={2.5} />
      <Ring className="top-[70%] left-[10%]" size={38} opacity={0.05} pulse delay={0.6} />

      <ShieldShape className="top-[22%] left-[8%]" size={30} opacity={0.1} float delay={0.5} />
      <ShieldShape className="top-[50%] right-[5%]" size={26} opacity={0.08} pulse delay={2} />
      <ShieldShape className="bottom-[25%] right-[18%]" size={22} opacity={0.07} float delay={1.2} />
      <ShieldShape className="top-[75%] left-[4%]" size={28} opacity={0.08} pulse delay={0.9} />

      <KeyHole className="top-[30%] right-[12%]" size={22} opacity={0.09} pulse delay={1.5} />
      <KeyHole className="bottom-[30%] left-[10%]" size={20} opacity={0.08} pulse delay={0.4} />
      <KeyHole className="top-[65%] right-[15%]" size={18} opacity={0.07} pulse delay={2.8} />

      <BinaryBlock className="top-[20%] left-[15%]" opacity={0.05} delay={1} />
      <BinaryBlock className="top-[55%] right-[4%]" opacity={0.04} delay={2.5} />
      <BinaryBlock className="bottom-[15%] left-[20%]" opacity={0.04} delay={0.5} />
      <BinaryBlock className="top-[40%] left-[3%]" opacity={0.05} delay={3} />

      <Dot className="top-[25%] right-[22%]" size={4} opacity={0.18} pulse delay={0.3} />
      <Dot className="top-[42%] left-[12%]" size={5} opacity={0.15} pulse delay={1.5} />
      <Dot className="bottom-[18%] right-[7%]" size={4} opacity={0.16} pulse delay={2} />
      <Dot className="top-[68%] left-[8%]" size={5} opacity={0.14} pulse delay={0.8} />
      <Dot className="top-[12%] right-[30%]" size={3} opacity={0.2} pulse delay={1.2} />
      <Dot className="bottom-[40%] right-[20%]" size={4} opacity={0.15} pulse delay={0.1} />

      <AppNav
        label="Employee Portal"
        altLink={{ href: "/dashboard", label: "Employer View" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Connect wallet prompt */}
        {view === "connect" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full max-w-md"
            >
              <div className="accent-card overflow-hidden p-8 text-center">
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
                <p className="mb-8 text-sm text-[var(--text-secondary)]">
                  Connect your wallet to see the organizations you belong to
                  and decrypt your balance.
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

        {/* Org selection — enter org address */}
        {view === "org-list" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <h1
                  className="text-3xl font-bold tracking-tight md:text-4xl mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Organizations
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Enter an organization contract address to view your balance
                </p>
              </div>

              {/* Org address input */}
              <div className="accent-card overflow-hidden p-6 mb-4">
                <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                  Organization Contract Address
                </label>
                <div className="flex gap-3">
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
                  Ask your employer for the organization contract address
                </p>
              </div>

              {/* Saved orgs */}
              {savedOrgs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--text-secondary)] px-1">
                    Previously joined
                  </p>
                  {savedOrgs.map((addr) => (
                    <SavedOrgCard
                      key={addr}
                      orgAddress={addr as `0x${string}`}
                      onClick={() => handleSelectSavedOrg(addr)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Balance view */}
        {view === "balance" && selectedOrgAddress && (
          <div className="py-8">
            {/* Header banner */}
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
                    </div>
                  </div>

                  {/* Encryption status */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-3 py-1.5">
                      <Lock className="h-3 w-3 text-[var(--accent)]" />
                      <span className="text-xs font-medium text-[var(--accent)]">
                        {isBalanceRevealed ? "Decrypted" : "Encrypted"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Decrypt error */}
            {decryptError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4"
              >
                <p className="text-xs text-red-400">{decryptError}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  FHE decryption may not be available on Sepolia testnet. You can still withdraw funds.
                </p>
              </motion.div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <BalanceCard
                  balance={decryptedBalance}
                  tokenSymbol={displaySymbol}
                  isRevealed={isBalanceRevealed}
                  isDecrypting={isDecrypting}
                  onToggleReveal={handleRevealBalance}
                />
                <TransactionHistory
                  orgAddress={selectedOrgAddress}
                  tokenSymbol={displaySymbol}
                  tokenDecimals={displayDecimals}
                />
              </div>

              {/* Right Column */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-6"
              >
                <WithdrawCard
                  orgAddress={selectedOrgAddress}
                  tokenSymbol={displaySymbol}
                  tokenDecimals={displayDecimals}
                  maxBalance={isBalanceRevealed ? decryptedBalance : null}
                  onWithdrawSuccess={refetchBalance}
                />
                <PrivacyInfo />
                <OrgInfo
                  orgName={orgName || `${selectedOrgAddress.slice(0, 6)}...${selectedOrgAddress.slice(-4)}`}
                  orgAddress={`${selectedOrgAddress.slice(0, 6)}...${selectedOrgAddress.slice(-4)}`}
                  tokenSymbol={displaySymbol}
                  createdDate={orgCreatedDate}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Card for a previously saved org — fetches name and shows it */
function SavedOrgCard({
  orgAddress,
  onClick,
}: {
  orgAddress: `0x${string}`;
  onClick: () => void;
}) {
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
          <p
            className="font-bold text-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {displayName}
          </p>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            {orgAddress.slice(0, 6)}...{orgAddress.slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {isETH ? "ETH" : "ERC-20"}
          </span>
          <ArrowLeft className="h-3 w-3 text-[var(--text-muted)] rotate-180" />
        </div>
      </div>
    </button>
  );
}
