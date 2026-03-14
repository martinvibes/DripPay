"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { AppNav } from "@/components/shared/AppNav";
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

export default function EmployeeBalance({ orgAddress }: { orgAddress: `0x${string}` }) {
  const { address: connectedAddress } = useAccount();

  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState("");

  const { decryptBalance } = useFhevm();

  const {
    orgName,
    paymentToken,
    createdAt,
    isETH,
    refetchBalance,
  } = useOrganization(orgAddress);

  const { data: balanceHandle, refetch: refetchHandle } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress] : undefined,
    query: { enabled: !!connectedAddress },
  });

  const {
    symbol: tokenSymbol,
    decimals: tokenDecimals,
  } = useERC20(
    !isETH && paymentToken ? paymentToken : undefined,
    orgAddress,
  );

  const displaySymbol = isETH ? "ETH" : tokenSymbol || "TOKEN";
  const displayDecimals = isETH ? 18 : tokenDecimals ?? 18;

  const handleRevealBalance = async () => {
    if (isBalanceRevealed) {
      setIsBalanceRevealed(false);
      setDecryptedBalance(null);
      return;
    }

    if (!connectedAddress) return;

    setIsDecrypting(true);
    setDecryptError("");

    try {
      const { data: freshHandle } = await refetchHandle();
      const handle = (freshHandle ?? balanceHandle) as `0x${string}`;

      if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setDecryptedBalance("0.000000");
        setIsBalanceRevealed(true);
        setIsDecrypting(false);
        return;
      }

      const result = await decryptBalance(handle, orgAddress);
      const raw = typeof result === "bigint" ? result : BigInt(String(result));
      const humanReadable = formatUnits(raw, displayDecimals);
      const num = parseFloat(humanReadable);
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      });
      setDecryptedBalance(formatted);
      setDecryptError("");
      setIsBalanceRevealed(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to decrypt balance";
      console.error("[Decrypt] Error:", err);
      setDecryptError(message);
      setDecryptedBalance(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const orgCreatedDate = createdAt
    ? new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

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
      <Hexagon className="bottom-[20%] left-[6%]" size={36} opacity={0.09} rotate delay={0.8} />
      <Ring className="top-[15%] right-[6%]" size={56} opacity={0.08} pulse delay={0.3} />
      <Ring className="top-[45%] left-[2%]" size={48} opacity={0.07} pulse delay={1.8} />
      <ShieldShape className="top-[22%] left-[8%]" size={30} opacity={0.1} float delay={0.5} />
      <ShieldShape className="top-[50%] right-[5%]" size={26} opacity={0.08} pulse delay={2} />
      <KeyHole className="top-[30%] right-[12%]" size={22} opacity={0.09} pulse delay={1.5} />
      <BinaryBlock className="top-[20%] left-[15%]" opacity={0.05} delay={1} />
      <Dot className="top-[25%] right-[22%]" size={4} opacity={0.18} pulse delay={0.3} />
      <Dot className="top-[42%] left-[12%]" size={5} opacity={0.15} pulse delay={1.5} />

      <AppNav
        label="Employee Portal"
        altLink={{ href: "/dashboard", label: "Employer View" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mb-4 sm:mb-8"
          >
            <motion.div
              variants={fadeUpSmall}
              custom={0}
              className="accent-card overflow-hidden px-4 py-4 sm:px-6 sm:py-5 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Link
                    href="/employee"
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="min-w-0">
                    <h1
                      className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {orgName || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {orgCreatedDate ? `Created ${orgCreatedDate} · ` : ""}
                      Paying in {displaySymbol}
                    </p>
                  </div>
                </div>
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

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <BalanceCard
                balance={decryptedBalance}
                tokenSymbol={displaySymbol}
                isRevealed={isBalanceRevealed}
                isDecrypting={isDecrypting}
                onToggleReveal={handleRevealBalance}
              />
              <TransactionHistory
                orgAddress={orgAddress}
                orgName={orgName || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <WithdrawCard
                orgAddress={orgAddress}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
                maxBalance={isBalanceRevealed ? decryptedBalance : null}
                onWithdrawSuccess={refetchBalance}
              />
              <PrivacyInfo />
              <OrgInfo
                orgName={orgName || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                orgAddress={`${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                tokenSymbol={displaySymbol}
                createdDate={orgCreatedDate}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
