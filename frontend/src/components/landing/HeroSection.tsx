"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Binary } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[var(--nav-height)]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[var(--bg-deep)]" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(0,229,160,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-20 right-0 w-[600px] h-[600px]"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.05) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[800px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 80%, rgba(0,180,216,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-60" />
      </div>

      {/* Animated orb */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            scale: [1, 1.05, 0.98, 1.03, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="h-[500px] w-[500px] rounded-full opacity-30 blur-[120px]"
            style={{ background: "var(--gradient-primary)" }}
          />
        </motion.div>
      </div>

      {/* Floating drip particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: `${15 + i * 18}%`, top: `${10 + i * 8}%` }}
          animate={{ y: [0, 120 + i * 30], opacity: [0, 0.6, 0] }}
          transition={{
            duration: 4 + i * 0.8,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeIn",
          }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: i % 2 === 0 ? "#00e5a0" : "#00b4d8" }}
          />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[var(--max-width)] px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-[var(--accent)] uppercase">
                Powered by Zama fhEVM
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-display), system-ui" }}
          >
            Private Payroll.
            <br />
            <span className="gradient-text">Onchain.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="max-w-xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
          >
            End-to-end encrypted payroll powered by Fully Homomorphic
            Encryption. Nobody sees what you earn — not even the blockchain.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col items-center gap-4 pt-2 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="btn-primary !py-3.5 !px-8 text-base"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary !py-3.5 !px-8 text-base"
            >
              How it Works
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={fadeUp}
            custom={4}
            className="pt-4 text-xs text-[var(--text-muted)]"
          >
            Built on Ethereum &middot; Encrypted by Zama &middot; Open Source
          </motion.p>
        </motion.div>

        {/* Hero visual — Encrypted payslip mockup */}
        <HeroPayslip />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-deep)] to-transparent" />
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
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-20 max-w-2xl"
    >
      <div className="border-gradient glow-accent">
        <div className="rounded-2xl bg-[var(--bg-primary)] p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Acme Corp — March Payroll
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Executed on block #18,294,021
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[rgba(0,229,160,0.1)] px-3 py-1">
              <Lock className="h-3 w-3 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--accent)]">
                FHE Encrypted
              </span>
            </div>
          </div>

          {/* Encrypted rows */}
          <div className="space-y-3">
            {rows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.15 }}
                className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.02)] px-4 py-3"
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
                      {[...Array(8)].map((_, j) => (
                        <motion.span
                          key={j}
                          animate={{ opacity: [0.2, 0.6, 0.2] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: j * 0.15 + i * 0.3,
                          }}
                          className="inline-block h-4 w-2.5 rounded-sm bg-[var(--accent)]"
                          style={{ opacity: 0.2 }}
                        />
                      ))}
                    </div>
                    <Binary className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Lock className="h-3 w-3" />
            <span>
              Only the employee can decrypt their salary using their wallet keys
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-40 w-3/4 blur-[80px] opacity-20"
        style={{ background: "var(--gradient-primary)" }}
      />
    </motion.div>
  );
}
