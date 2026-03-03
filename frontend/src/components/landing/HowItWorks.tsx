"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { steps } from "@/lib/mock-data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] opacity-30 blur-[150px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[var(--max-width)] px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mb-20 text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]"
          >
            How it Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Four Steps to Private Payroll
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative"
            >
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute top-8 left-full hidden w-full lg:block">
                  <div className="h-px w-full bg-gradient-to-r from-[var(--border)] to-transparent" />
                </div>
              )}

              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-all group-hover:border-[var(--border-accent)] group-hover:bg-[var(--accent-muted)]">
                  <step.icon className="h-7 w-7 text-[var(--accent)] transition-transform group-hover:scale-110" />
                </div>
              </div>

              <span
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Step {step.num}
              </span>

              <h3
                className="mb-2 text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
