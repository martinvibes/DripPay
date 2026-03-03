"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { features } from "@/lib/mock-data";

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative mesh-gradient">
      <div className="relative z-10 mx-auto max-w-[var(--max-width)] px-6">
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
            className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]"
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
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
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i}
              className="glass-card glow-accent-hover group relative overflow-hidden p-8"
            >
              <div
                className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: feature.accent }}
              />

              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${feature.accent}12` }}
              >
                <feature.icon
                  className="h-6 w-6"
                  style={{ color: feature.accent }}
                />
              </div>

              <h3
                className="mb-3 text-xl font-bold"
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
