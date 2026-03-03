"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Wallet, Lock, Fingerprint } from "lucide-react";
import { useAccount } from "wagmi";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { OrgSelector } from "@/components/shared/OrgSelector";
import { BalanceCard } from "@/components/employee/BalanceCard";
import { TransactionHistory } from "@/components/employee/TransactionHistory";
import { WithdrawCard } from "@/components/employee/WithdrawCard";
import { PrivacyInfo } from "@/components/employee/PrivacyInfo";
import { OrgInfo } from "@/components/employee/OrgInfo";
import { mockEmployeeOrgs } from "@/lib/mock-data";
import type { Organization } from "@/lib/mock-data";
import { fadeUpSmall } from "@/lib/animations";
import {
  Hexagon,
  Ring,
  ShieldShape,
  KeyHole,
  BinaryBlock,
  Dot,
} from "@/components/shared/Stars";

type View = "connect" | "org-list" | "balance";

export default function EmployeePage() {
  const { isConnected } = useAccount();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const view: View = !isConnected
    ? "connect"
    : !selectedOrg
      ? "org-list"
      : "balance";

  const handleRevealBalance = () => {
    if (isBalanceRevealed) {
      setIsBalanceRevealed(false);
      return;
    }
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      setIsBalanceRevealed(true);
    }, 2000);
  };

  const handleBack = () => {
    setSelectedOrg(null);
    setIsBalanceRevealed(false);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      {/* Ambient background — different from dashboard, more centered/focused */}
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

      {/* Encryption-themed decorative elements */}
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
                {/* Decorative rings behind icon */}
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

        {/* Org selection */}
        {view === "org-list" && (
          <OrgSelector
            title="Your Organizations"
            subtitle="Select an organization to view your balance"
            orgs={mockEmployeeOrgs}
            onSelect={(org) => setSelectedOrg(org)}
          />
        )}

        {/* Balance view */}
        {view === "balance" && selectedOrg && (
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
                        {selectedOrg.name}
                      </h1>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        View your encrypted balance and transaction history
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

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <BalanceCard
                  isRevealed={isBalanceRevealed}
                  isDecrypting={isDecrypting}
                  onToggleReveal={handleRevealBalance}
                />
                <TransactionHistory isRevealed={isBalanceRevealed} />
              </div>

              {/* Right Column */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-6"
              >
                <WithdrawCard />
                <PrivacyInfo />
                <OrgInfo
                  orgName={selectedOrg.name}
                  orgAddress={selectedOrg.address}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
