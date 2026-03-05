"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Binary } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";
import { Star4, Star6, CrossMark, Diamond, Dot, DotCluster } from "@/components/shared/Stars";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[var(--nav-height)]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        {/* Primary green glow */}
        <div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 30%, rgba(0,229,160,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Secondary deeper glow */}
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.02, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,229,160,0.05) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Decorative stars & sparkles */}
      <Star4 className="top-[18%] left-[8%]" size={20} opacity={0.15} pulse delay={0} />
      <Star4 className="top-[12%] right-[10%]" size={14} opacity={0.1} rotate delay={1.5} />
      <Star6 className="top-[35%] left-[5%]" size={18} opacity={0.07} rotate delay={0.5} />
      <Star4 className="bottom-[30%] right-[7%]" size={24} opacity={0.12} pulse delay={2} />
      <CrossMark className="top-[25%] right-[18%]" size={10} opacity={0.1} rotate delay={0.8} />
      <CrossMark className="top-[45%] left-[12%]" size={8} opacity={0.08} delay={2.5} />
      <Diamond className="top-[20%] right-[25%]" size={6} opacity={0.12} pulse delay={1} />
      <Diamond className="bottom-[35%] left-[15%]" size={8} opacity={0.1} float delay={0.3} />
      <Dot className="top-[30%] left-[20%]" size={3} opacity={0.2} pulse delay={0.5} />
      <Dot className="top-[15%] right-[30%]" size={4} opacity={0.15} pulse delay={1.8} />
      <Dot className="bottom-[25%] right-[15%]" size={3} opacity={0.18} pulse delay={2.2} />
      <DotCluster className="top-[40%] right-[5%]" opacity={0.1} delay={1.2} />

      {/* Subtle grid lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-4 py-1.5 backdrop-blur-sm">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
              />
              <span className="text-xs font-medium tracking-wide text-[var(--accent)]">
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
            Encryption. Nobody sees what you earn not even the blockchain.
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
          <motion.div
            variants={fadeUp}
            custom={4}
            className="flex items-center gap-6 pt-2 text-xs text-[var(--text-muted)]"
          >
            {["Built on Ethereum", "Encrypted by Zama", "Open Source"].map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                {i > 0 && <span className="h-3 w-px bg-[var(--border)]" />}
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero card */}
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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative mx-auto mt-16 max-w-2xl"
    >
      <div className="accent-card overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
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
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-2.5 py-1">
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
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.12 }}
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
                    {[...Array(7)].map((_, j) => (
                      <motion.span
                        key={j}
                        animate={{ opacity: [0.12, 0.45, 0.12] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: j * 0.12 + i * 0.2,
                        }}
                        className="inline-block h-3.5 w-2 rounded-[2px] bg-[var(--accent)]"
                        style={{ opacity: 0.12 }}
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

      {/* Glow under card */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 h-24 w-2/3 rounded-full blur-[60px] bg-[var(--accent)] opacity-[0.06]" />
    </motion.div>
  );
}
