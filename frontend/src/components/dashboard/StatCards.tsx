"use client";

import { motion } from "framer-motion";
import { Building2, Users, Shield, TrendingUp, MoreHorizontal } from "lucide-react";
import { fadeUpSmall, staggerFast } from "@/lib/animations";
import { mockEmployees, payrollHistory } from "@/lib/mock-data";

interface StatCardsProps {
  orgName?: string;
}

const getStatCards = (orgName: string) => [
  {
    icon: Building2,
    label: "Organization",
    value: orgName,
    sub: "Deployed on Ethereum Sepolia",
  },
  {
    icon: Users,
    label: "Employees",
    value: mockEmployees.length.toString(),
    sub: `${mockEmployees.filter((e) => e.status === "active").length} active`,
  },
  {
    icon: Shield,
    label: "Payroll Status",
    value: "Up to date",
    sub: "Last run: Feb 28",
  },
  {
    icon: TrendingUp,
    label: "Total Runs",
    value: payrollHistory.length.toString(),
    sub: "All encrypted",
  },
];

export function StatCards({ orgName = "My Organization" }: StatCardsProps) {
  const statCards = getStatCards(orgName);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerFast}
      className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={fadeUpSmall}
          custom={i}
          className="stat-card group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
              <stat.icon className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <MoreHorizontal className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-1">
            {stat.label}
          </p>
          <p
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stat.value}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {stat.sub}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
