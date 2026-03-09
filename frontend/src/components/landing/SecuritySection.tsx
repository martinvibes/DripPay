"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Zap, EyeOff, Sparkles } from "lucide-react";
import { fadeUp, stagger } from "@/lib/animations";
import { Star4, CrossMark, Dot } from "@/components/shared/Stars";
import { useState, useEffect } from "react";

const SECURITY_POINTS = [
  "Salaries encrypted with TFHE before reaching the chain",
  "Computations performed entirely on ciphertext",
  "Only the employee's wallet can decrypt their balance",
  "Zero plaintext exposure ever",
];

export function SecuritySection() {
  return (
    <section id="security" className="section-padding relative overflow-hidden">
      {/* Decorative elements */}
      <Star4
        className="top-[12%] right-[10%]"
        size={16}
        opacity={0.1}
        pulse
        delay={0.8}
      />
      <Star4
        className="bottom-[18%] left-[5%]"
        size={14}
        opacity={0.12}
        rotate
        delay={1.5}
      />
      <CrossMark
        className="top-[8%] left-[15%]"
        size={10}
        opacity={0.08}
        rotate
        delay={0.3}
      />
      <Dot
        className="top-[25%] right-[20%]"
        size={3}
        opacity={0.15}
        pulse
        delay={1}
      />
      <Dot
        className="bottom-[15%] right-[8%]"
        size={4}
        opacity={0.12}
        pulse
        delay={2}
      />

      <div className="mx-auto max-w-[var(--max-width)] px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left — Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]"
            >
              Advanced Privacy
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Numbers,
              <br />
              <span className="text-secondary">Nobody Else&apos;s Eyes.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mb-8 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              We&apos;ve built a &quot;Black Box&quot; for your payroll. Using
              Zama&apos;s Fully Homomorphic Encryption, we process payments
              while the amounts stay hidden from the entire world — even from
              the blockchain itself.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="space-y-4">
              {SECURITY_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-muted">
                    <Shield className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {point}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Privacy Visualization */}
          <PrivacyVisualization />
        </div>
      </div>
    </section>
  );
}

function PrivacyVisualization() {
  const [stage, setStage] = useState(0); // 0: plaintext, 1: encrypting, 2: processing, 3: result

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative aspect-square w-full max-w-md lg:ml-auto"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-secondary/5 blur-[120px] rounded-full" />

      {/* Main Container */}
      <div className="relative h-full w-full rounded-3xl border border-border bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8">
        {/* The Shield Icon Centerpiece */}
        <div className="relative z-10 mb-8 mt-4">
          <motion.div
            animate={
              stage === 2
                ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 1, repeat: stage === 2 ? Infinity : 0 }}
            className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-accent-muted border border-accent/20 shadow-[0_0_30px_rgba(0,229,160,0.1)]"
          >
            {/* Spinning ring inside when processing */}
            {stage === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-dashed border-accent opacity-30"
              />
            )}

            <AnimatePresence mode="wait">
              {stage === 0 && (
                <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                >
                  <Lock className="h-12 w-12 text-accent opacity-40" />
                </motion.div>
              )}
              {(stage === 1 || stage === 2) && (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                >
                  <Shield className="h-14 w-14 text-accent" strokeWidth={1.5} />
                </motion.div>
              )}
              {stage === 3 && (
                <motion.div
                  key="sparkle"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                >
                  <Sparkles className="h-12 w-12 text-accent" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Radar Waves */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-32 w-32 rounded-full border border-accent/30"
            />
          </div>
        </div>

        {/* Textual Feedback */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="text-lg font-bold mb-1">
                {stage === 0 && "Plaintext Input"}
                {stage === 1 && "Encrypting Data"}
                {stage === 2 && "Secured Calculation"}
                {stage === 3 && "Protected Outcome"}
              </h4>
              <p className="max-w-60 mx-auto text-sm italic text-text-muted">
                {stage === 0 && "Salary data ready for processing."}
                {stage === 1 && "Wrapping data in a privacy shell."}
                {stage === 2 && "Computing math on ciphertexts."}
                {stage === 3 && "Credits distributed privately."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Data Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingNode
            delay={0}
            x="15%"
            y="20%"
            icon={<Zap className="h-4 w-4" />}
            color="text-yellow-400"
          />
          <FloatingNode
            delay={1}
            x="85%"
            y="30%"
            icon={<Lock className="h-4 w-4" />}
            color="text-accent"
          />
          <FloatingNode
            delay={2}
            x="20%"
            y="75%"
            icon={<EyeOff className="h-4 w-4" />}
            color="text-secondary"
          />
          <FloatingNode
            delay={3}
            x="80%"
            y="80%"
            icon={<Shield className="h-3 w-3" />}
            color="text-accent"
          />
        </div>
      </div>

      {/* External floating elements */}
      <div className="absolute -top-4 -right-4 h-20 w-20 rounded-2xl bg-accent opacity-[0.03] blur-xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-secondary opacity-[0.04] blur-2xl" />
    </motion.div>
  );
}

function FloatingNode({
  x,
  y,
  delay,
  icon,
  color,
}: {
  x: string;
  y: string;
  delay: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      initial={{ x, y, rotate: 0, opacity: 0 }}
      animate={{
        y: [y, `calc(${y} - 20px)`, y],
        rotate: [0, 15, -15, 0],
        opacity: [0, 0.4, 0.4, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={`absolute flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/60 backdrop-blur-md ${color} shadow-lg`}
    >
      {icon}
    </motion.div>
  );
}
