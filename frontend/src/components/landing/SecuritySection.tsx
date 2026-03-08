"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { fadeUp, stagger } from "@/lib/animations";
import { Star4, CrossMark, Dot } from "@/components/shared/Stars";

const SECURITY_POINTS = [
  "Salaries encrypted with TFHE before reaching the chain",
  "Computations performed entirely on ciphertext",
  "Only the employee's wallet can decrypt their balance",
  "Zero plaintext exposure ever",
];

export function SecuritySection() {
  return (
    <section id="security" className="section-padding relative">
      {/* Decorative elements */}
      <Star4 className="top-[12%] right-[10%]" size={16} opacity={0.1} pulse delay={0.8} />
      <Star4 className="bottom-[18%] left-[5%]" size={14} opacity={0.12} rotate delay={1.5} />
      <CrossMark className="top-[8%] left-[15%]" size={10} opacity={0.08} rotate delay={0.3} />
      <Dot className="top-[25%] right-[20%]" size={3} opacity={0.15} pulse delay={1} />
      <Dot className="bottom-[15%] right-[8%]" size={4} opacity={0.12} pulse delay={2} />

      <div className="mx-auto max-w-[var(--max-width)] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
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
              Security
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Encrypted at
              <br />
              Every Layer
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mb-8 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              DripPay uses Zama&apos;s Fully Homomorphic Encryption to perform
              computations on encrypted data. Salaries are never exposed — not
              to validators, not to other employees, not to anyone except the
              intended recipient.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="space-y-3">
              {SECURITY_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-2.5">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {point}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Code snippet */}
          <CodeSnippet />
        </div>
      </div>
    </section>
  );
}

function CodeSnippet() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
        {/* Tab bar */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" />
          </div>
          <span className="ml-3 text-xs text-[var(--text-muted)] font-mono">
            Organization.sol
          </span>
        </div>
        {/* Code */}
        <div className="p-5 font-mono text-[13px] leading-relaxed">
          <CodeLine delay={0} dimmed>{`// Salary is NEVER stored in plaintext`}</CodeLine>
          <CodeLine delay={0.05}><Kw>function</Kw> <Fn>setSalary</Fn>(</CodeLine>
          <CodeLine delay={0.1}>{"  "}address <Var>employee</Var>,</CodeLine>
          <CodeLine delay={0.15}>{"  "}einput <Var>encryptedAmount</Var>,</CodeLine>
          <CodeLine delay={0.2}>{"  "}bytes <Kw>calldata</Kw> <Var>proof</Var></CodeLine>
          <CodeLine delay={0.25}>) <Kw>external</Kw> onlyAdmin {"{"}</CodeLine>
          <CodeLine delay={0.3}>{"  "}euint64 salary = <Fn>TFHE.asEuint64</Fn>(</CodeLine>
          <CodeLine delay={0.35}>{"    "}<Var>encryptedAmount</Var>, <Var>proof</Var></CodeLine>
          <CodeLine delay={0.4}>{"  "});</CodeLine>
          <CodeLine delay={0.45}>{"  "}salaries[<Var>employee</Var>] = salary;</CodeLine>
          <CodeLine delay={0.5} dimmed>{"  "}// Grant view access to employee only</CodeLine>
          <CodeLine delay={0.55}>{"  "}<Fn>TFHE.allow</Fn>(salary, <Var>employee</Var>);</CodeLine>
          <CodeLine delay={0.6}>{"}"}</CodeLine>
        </div>
      </div>
    </motion.div>
  );
}

function CodeLine({
  children,
  delay = 0,
  dimmed = false,
}: {
  children: React.ReactNode;
  delay?: number;
  dimmed?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      whileInView={{ opacity: dimmed ? 0.3 : 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className={dimmed ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}
    >
      {children}
    </motion.div>
  );
}

function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-[#a1a1aa]">{children}</span>;
}

function Fn({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--accent)]">{children}</span>;
}

function Var({ children }: { children: React.ReactNode }) {
  return <span className="text-[#e4e4e7]">{children}</span>;
}
