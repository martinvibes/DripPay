"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { features } from "@/lib/mock-data";

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding">
      <div className="mx-auto max-w-[var(--max-width)] px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mb-14 text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]"
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Privacy by Default
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid gap-5 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 transition-colors hover:border-[var(--border-hover)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
                <feature.icon className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <h3
                className="mb-2.5 text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {feature.title}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
