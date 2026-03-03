"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { steps } from "@/lib/mock-data";
import { Star4, Star6, Diamond, DotCluster } from "@/components/shared/Stars";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding relative">
      {/* Decorative elements */}
      <Star4 className="top-[8%] left-[5%]" size={18} opacity={0.1} pulse delay={0.3} />
      <Star6 className="top-[15%] right-[8%]" size={16} opacity={0.07} rotate delay={1} />
      <Star4 className="bottom-[12%] right-[6%]" size={14} opacity={0.12} rotate delay={2} />
      <Diamond className="top-[30%] left-[8%]" size={6} opacity={0.1} pulse delay={0.8} />
      <Diamond className="bottom-[20%] left-[15%]" size={8} opacity={0.08} float delay={1.5} />
      <DotCluster className="bottom-[10%] right-[15%]" opacity={0.08} delay={0.5} />

      <div className="mx-auto max-w-[var(--max-width)] px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mb-16 text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]"
          >
            How it Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Four Steps to Private Payroll
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="relative"
            >
              {/* Step number */}
              <span
                className="mb-4 block text-[40px] font-extrabold leading-none text-[var(--accent)] opacity-20"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.num}
              </span>

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
                <step.icon className="h-4.5 w-4.5 text-[var(--accent)]" />
              </div>

              <h3
                className="mb-2 text-base font-bold"
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
