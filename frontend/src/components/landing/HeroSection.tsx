"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";
import { Star4, Star6, CrossMark, Diamond, Dot, DotCluster } from "@/components/shared/Stars";

/* ─────────────────────────────────────────────
   Letter-stagger animation for hero text
   ───────────────────────────────────────────── */
function StaggerText({ text, delayStart = 0 }: { text: string; delayStart?: number }) {
  return (
    <span aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delayStart + i * 0.04,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Floating encrypted hex particles
   ───────────────────────────────────────────── */
const HEX_FRAGMENTS = [
  "0x7f3a...",
  "0xe91c...",
  "0x2bd4...",
  "0xa0f8...",
  "0x53e7...",
  "0xd6b1...",
  "0x9c42...",
  "0x1fa9...",
  "0xbb07...",
  "0x4e5d...",
  "0xf2c3...",
  "0x68a0...",
];

function FloatingParticles() {
  const particles = useMemo(
    () =>
      HEX_FRAGMENTS.map((hex, i) => ({
        hex,
        x: `${5 + (i % 6) * 16 + Math.random() * 8}%`,
        y: `${8 + Math.floor(i / 6) * 45 + Math.random() * 30}%`,
        delay: i * 0.7,
        duration: 12 + Math.random() * 8,
        drift: 20 + Math.random() * 30,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-[10px] text-[var(--accent)] select-none"
          style={{ left: p.x, top: p.y, opacity: 0 }}
          animate={{
            opacity: [0, 0.12, 0.12, 0],
            y: [0, -p.drift],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.hex}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Aurora background
   ───────────────────────────────────────────── */
function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Core aurora bloom */}
      <motion.div
        animate={{
          opacity: [0.06, 0.12, 0.06],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 35%, rgba(0,229,160,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Secondary bloom - offset */}
      <motion.div
        animate={{
          opacity: [0.04, 0.09, 0.04],
          scale: [1.05, 0.95, 1.05],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[-5%] left-1/2 -translate-x-[40%] w-[900px] h-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 40% 40%, rgba(0,229,160,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Tertiary bloom - right side */}
      <motion.div
        animate={{
          opacity: [0.03, 0.07, 0.03],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[5%] left-1/2 -translate-x-[60%] w-[800px] h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 60% 30%, rgba(0,229,160,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Left side glow that drifts */}
      <motion.div
        animate={{ x: [-40, 40, -40], opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[5%] w-[400px] h-[400px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Right side glow that drifts */}
      <motion.div
        animate={{ x: [30, -30, 30], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[20%] right-[5%] w-[350px] h-[350px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Scroll indicator
   ───────────────────────────────────────────── */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════
   HERO SECTION
   ═════════════════════════════════════════════ */
export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[var(--nav-height)]">
      {/* Aurora background */}
      <AuroraBackground />

      {/* Floating encrypted particles */}
      <FloatingParticles />

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
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
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
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] mt-7 px-4 py-1.5 backdrop-blur-sm">
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

          {/* Headline — massive typography */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="max-w-6xl text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-[8.5rem]"
            style={{ fontFamily: "var(--font-display), system-ui" }}
          >
            <StaggerText text="Private" delayStart={0.3} />
            <span className="inline-block ml-[0.3em]">
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
                className="inline-block"
              >
                Payroll
              </motion.span>
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
              className="gradient-text inline-block"
            >
              Onchain.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg lg:text-xl"
          >
            End-to-end encrypted payroll powered by Fully Homomorphic
            Encryption. Nobody sees what you earn — not even the blockchain.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center gap-4 pt-2"
          >
            <Link href="/dashboard" className="btn-primary !py-3.5 !px-8 text-base">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary !py-3.5 !px-8 text-base">
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

        {/* Hero payslip card */}
        <HeroPayslip />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-deep)] to-transparent z-10" />

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}

/* ═════════════════════════════════════════════
   HERO PAYSLIP — animated encryption demo
   ═════════════════════════════════════════════ */

type PayslipPhase = "exposed" | "encrypting" | "encrypted";

const PHASE_DURATIONS = {
  exposed: 2200,
  encrypting: 2500,
  encrypted: 3300,
};

const PAYSLIP_ROWS = [
  { label: "Employee", value: "0x7a3...f92e", encrypted: "••••••••" },
  { label: "Salary", value: "$8,500.00", encrypted: "••••••••" },
  { label: "YTD Total", value: "$42,500.00", encrypted: "••••••••" },
];

function HeroPayslip() {
  const [phase, setPhase] = useState<PayslipPhase>("exposed");

  useEffect(() => {
    // Start the loop after initial card animation (delay 1.2s)
    const startTimeout = setTimeout(() => {
      let current: PayslipPhase = "exposed";

      const cycle = () => {
        setPhase(current);
        const duration = PHASE_DURATIONS[current];
        setTimeout(() => {
          if (current === "exposed") current = "encrypting";
          else if (current === "encrypting") current = "encrypted";
          else current = "exposed";
          cycle();
        }, duration);
      };

      cycle();
    }, 1200);

    return () => clearTimeout(startTimeout);
  }, []);

  const borderColor =
    phase === "exposed"
      ? "rgba(239,68,68,0.3)"
      : phase === "encrypting"
      ? "rgba(234,179,8,0.3)"
      : "rgba(0,229,160,0.3)";

  const glowColor =
    phase === "exposed"
      ? "rgba(239,68,68,0.06)"
      : phase === "encrypting"
      ? "rgba(234,179,8,0.06)"
      : "rgba(0,229,160,0.08)";

  const statusColor =
    phase === "exposed"
      ? "#ef4444"
      : phase === "encrypting"
      ? "#eab308"
      : "#00e5a0";

  const statusBg =
    phase === "exposed"
      ? "rgba(239,68,68,0.1)"
      : phase === "encrypting"
      ? "rgba(234,179,8,0.1)"
      : "rgba(0,229,160,0.07)";

  const statusBorder =
    phase === "exposed"
      ? "rgba(239,68,68,0.25)"
      : phase === "encrypting"
      ? "rgba(234,179,8,0.25)"
      : "rgba(0,229,160,0.2)";

  const statusLabel =
    phase === "exposed"
      ? "Exposed"
      : phase === "encrypting"
      ? "Encrypting..."
      : "Encrypted";

  const StatusIcon = phase === "exposed" ? Eye : phase === "encrypting" ? EyeOff : Lock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative mx-auto mt-20 max-w-2xl"
    >
      {/* Card with animated border */}
      <motion.div
        className="overflow-hidden rounded-2xl backdrop-blur-sm"
        animate={{
          borderColor: borderColor,
          boxShadow: `0 0 60px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          border: `1px solid ${borderColor}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
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
                Acme Corp March Payroll
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Block #18,294,021
              </p>
            </div>
          </div>

          {/* Animated status badge */}
          <motion.div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            animate={{
              borderColor: statusBorder,
              backgroundColor: statusBg,
            }}
            transition={{ duration: 0.4 }}
            style={{ border: `1px solid ${statusBorder}` }}
          >
            <motion.div
              key={phase}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <StatusIcon className="h-3 w-3" style={{ color: statusColor }} />
            </motion.div>
            <motion.span
              key={`label-${phase}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-medium"
              style={{ color: statusColor }}
            >
              {statusLabel}
            </motion.span>
          </motion.div>
        </div>

        {/* Rows */}
        <div className="px-6 py-4 space-y-2.5">
          {PAYSLIP_ROWS.map((row, i) => (
            <PayslipRow
              key={row.label}
              label={row.label}
              plaintext={row.value}
              phase={phase}
              index={i}
            />
          ))}
        </div>

        {/* Footer with encrypting shimmer */}
        <div className="relative px-6 pb-4 overflow-hidden">
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 relative z-10">
            <Lock className="h-3 w-3" />
            {phase === "exposed"
              ? "Warning: salary data is visible on-chain"
              : phase === "encrypting"
              ? "Encrypting with Zama FHE..."
              : "Only the employee can decrypt their salary"}
          </p>

          {/* Encrypting shimmer line */}
          <AnimatePresence>
            {phase === "encrypting" && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-0 left-0 w-1/3 h-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(234,179,8,0.06), transparent)",
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ENCRYPTED stamp */}
        <AnimatePresence>
          {phase === "encrypted" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.2,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              <div
                className="rounded-lg border-2 px-6 py-2 font-mono text-sm font-bold tracking-[0.3em] uppercase"
                style={{
                  color: "rgba(0,229,160,0.5)",
                  borderColor: "rgba(0,229,160,0.3)",
                  background: "rgba(0,229,160,0.03)",
                  backdropFilter: "blur(2px)",
                }}
              >
                ENCRYPTED
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Glow under card */}
      <motion.div
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 h-24 w-2/3 rounded-full blur-[60px]"
        animate={{
          backgroundColor:
            phase === "exposed"
              ? "rgba(239,68,68,0.06)"
              : phase === "encrypting"
              ? "rgba(234,179,8,0.06)"
              : "rgba(0,229,160,0.08)",
        }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Individual payslip row with phase transitions
   ───────────────────────────────────────────── */
function PayslipRow({
  label,
  plaintext,
  phase,
  index,
}: {
  label: string;
  plaintext: string;
  phase: PayslipPhase;
  index: number;
}) {
  const staggerDelay = index * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.12 }}
      className="flex items-center justify-between rounded-xl px-4 py-3 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <span className="text-sm text-[var(--text-secondary)] relative z-10">
        {label}
      </span>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {phase === "exposed" ? (
            <motion.span
              key="plain"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: staggerDelay }}
              className="font-mono text-sm text-red-400"
            >
              {plaintext}
            </motion.span>
          ) : phase === "encrypting" ? (
            <motion.span
              key="encrypting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: staggerDelay }}
              className="flex items-center gap-2"
            >
              <EncryptingBlocks delay={staggerDelay} />
            </motion.span>
          ) : (
            <motion.span
              key="encrypted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: staggerDelay }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                {[...Array(7)].map((_, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.45, scale: 1 }}
                    transition={{ delay: staggerDelay + j * 0.04, duration: 0.2 }}
                    className="inline-block h-3.5 w-2 rounded-[2px] bg-[var(--accent)]"
                  />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: staggerDelay + 0.3, duration: 0.3 }}
              >
                <Lock className="h-3 w-3 text-[var(--accent)]" />
              </motion.div>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Row-level encrypting shimmer */}
      <AnimatePresence>
        {phase === "encrypting" && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "200%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: staggerDelay,
            }}
            className="absolute inset-0 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(234,179,8,0.05), transparent)",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Encrypting blocks animation (yellow shimmer)
   ───────────────────────────────────────────── */
function EncryptingBlocks({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(7)].map((_, j) => (
        <motion.span
          key={j}
          animate={{
            opacity: [0.15, 0.5, 0.15],
            backgroundColor: [
              "rgba(234,179,8,0.4)",
              "rgba(234,179,8,0.8)",
              "rgba(234,179,8,0.4)",
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: delay + j * 0.08,
            ease: "easeInOut",
          }}
          className="inline-block h-3.5 w-2 rounded-[2px]"
          style={{ backgroundColor: "rgba(234,179,8,0.4)" }}
        />
      ))}
    </div>
  );
}
