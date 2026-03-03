"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppNav } from "@/components/shared/AppNav";
import { BalanceCard } from "@/components/employee/BalanceCard";
import { TransactionHistory } from "@/components/employee/TransactionHistory";
import { WithdrawCard } from "@/components/employee/WithdrawCard";
import { PrivacyInfo } from "@/components/employee/PrivacyInfo";
import { OrgInfo } from "@/components/employee/OrgInfo";
import { fadeUpSmall } from "@/lib/animations";

export default function EmployeePage() {
  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

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

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <AppNav
        label="Employee Portal"
        altLink={{ href: "/dashboard", label: "Employer View" }}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
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
              My Balance
            </h1>
          </motion.div>
          <motion.p
            variants={fadeUpSmall}
            custom={1}
            className="text-sm text-[var(--text-secondary)] ml-7"
          >
            View your encrypted balance and transaction history
          </motion.p>
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
            <OrgInfo />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
