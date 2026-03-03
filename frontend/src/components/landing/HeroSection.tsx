"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Binary } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[var(--nav-height)]">
      {/* Single subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,229,160,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[var(--max-width)] px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs tracking-wide text-[var(--text-secondary)]">
                Powered by Zama fhEVM
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            style={{ fontFamily: "var(--font-display), system-ui" }}
          >
            Private Payroll,
            <br />
            <span className="gradient-text">Onchain</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="max-w-lg text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
          >
            End-to-end encrypted payroll powered by Fully Homomorphic
            Encryption. Nobody sees what you earn — not even the blockchain.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center gap-3 pt-4"
          >
            <Link href="/dashboard" className="btn-primary !py-3 !px-7">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary !py-3 !px-7">
              How it Works
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={fadeUp}
            custom={4}
            className="pt-2 text-xs text-[var(--text-muted)]"
          >
            Built on Ethereum &middot; Encrypted by Zama &middot; Open Source
          </motion.p>
        </motion.div>

        {/* Hero card — Encrypted payslip */}
        <HeroPayslip />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-deep)] to-transparent" />
    </section>
  );
}

function HeroPayslip() {
  const rows = [
    { label: "Employee", wallet: "0x7a3...f92e" },
    { label: "Salary", wallet: null },
    { label: "YTD Total", wallet: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      className="mx-auto mt-16 max-w-2xl"
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Acme Corp — March Payroll
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Block #18,294,021
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] px-2.5 py-1">
            <Lock className="h-3 w-3 text-[var(--accent)]" />
            <span className="text-[11px] font-medium text-[var(--accent)]">
              Encrypted
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="px-6 py-4 space-y-2.5">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.12 }}
              className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-4 py-3"
            >
              <span className="text-sm text-[var(--text-secondary)]">
                {row.label}
              </span>
              {row.wallet ? (
                <span className="font-mono text-sm text-[var(--text-primary)]">
                  {row.wallet}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(7)].map((_, j) => (
                      <motion.span
                        key={j}
                        animate={{ opacity: [0.15, 0.4, 0.15] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: j * 0.12 + i * 0.2,
                        }}
                        className="inline-block h-3.5 w-2 rounded-[2px] bg-[var(--accent)]"
                        style={{ opacity: 0.15 }}
                      />
                    ))}
                  </div>
                  <Binary className="h-3 w-3 text-[var(--text-muted)]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="px-6 pb-4">
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Only the employee can decrypt their salary
          </p>
        </div>
      </div>
    </motion.div>
  );
}
