"use client";

import { motion } from "framer-motion";
import { Building2, Users, Shield, TrendingUp, Wallet } from "lucide-react";
import { fadeUpSmall, staggerFast } from "@/lib/animations";

interface StatCardsProps {
  orgName?: string;
  employeeCount?: number;
  activeCount?: number;
  contractBalance?: bigint;
  isETH?: boolean;
  tokenSymbol?: string;
  tokenDecimals?: number;
  payrollRunCount?: number;
}

/** Mini sparkline SVG — gives each card a visual pulse */
function Sparkline({
  data,
  color = "var(--accent)",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="url(#sparkFill)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* End dot */}
      <circle
        cx={w}
        cy={parseFloat(points.split(" ").pop()!.split(",")[1])}
        r="2"
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
}

const sparkData = {
  employees: [2, 2, 3, 3, 4, 4],
  payrolls: [1, 2, 2, 3, 3, 4],
  status: [1, 1, 1, 1, 1, 1],
  growth: [10, 18, 22, 30, 35, 42],
};

function formatBalance(bal: bigint | undefined, isETH: boolean, decimals: number) {
  if (bal === undefined) return "—";
  if (isETH) {
    const eth = Number(bal) / 1e18;
    return eth.toFixed(eth < 0.01 ? 6 : 4);
  }
  const val = Number(bal) / 10 ** decimals;
  return val.toFixed(val < 0.01 ? 6 : 2);
}

const getStatCards = (
  orgName: string,
  empCount: number,
  activeCount: number,
  contractBalance: bigint | undefined,
  isETH: boolean,
  tokenSymbol: string,
  tokenDecimals: number,
  payrollRunCount: number,
) => [
  {
    icon: Building2,
    label: "Organization",
    value: orgName,
    sub: "Deployed on Ethereum Sepolia",
    spark: null,
  },
  {
    icon: Users,
    label: "Employees",
    value: empCount.toString(),
    sub: `${activeCount} active`,
    spark: sparkData.employees,
  },
  {
    icon: Wallet,
    label: "Contract Balance",
    value: `${formatBalance(contractBalance, isETH, tokenDecimals)} ${tokenSymbol}`,
    sub: "Available for withdrawals",
    spark: sparkData.growth,
  },
  {
    icon: TrendingUp,
    label: "Total Runs",
    value: payrollRunCount.toString(),
    sub: "All encrypted",
    spark: sparkData.payrolls,
  },
];

export function StatCards({
  orgName = "My Organization",
  employeeCount = 0,
  activeCount = 0,
  contractBalance,
  isETH = true,
  tokenSymbol,
  tokenDecimals = 18,
  payrollRunCount = 0,
}: StatCardsProps) {
  const symbol = tokenSymbol || (isETH ? "ETH" : "TOKEN");
  const statCards = getStatCards(orgName, employeeCount, activeCount, contractBalance, isETH, symbol, tokenDecimals, payrollRunCount);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerFast}
      className="mb-4 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
    >
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={fadeUpSmall}
          custom={i}
          className="stat-card group relative overflow-hidden"
        >
          {/* Subtle corner glow on hover */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--accent)] opacity-0 blur-[30px] transition-opacity duration-500 group-hover:opacity-[0.08]" />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] transition-colors group-hover:bg-[rgba(0,229,160,0.12)]">
                <stat.icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              {stat.spark && (
                <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                  <Sparkline data={stat.spark} />
                </div>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-1">
              {stat.label}
            </p>
            <p
              className="text-lg sm:text-xl font-bold tracking-tight truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {stat.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
