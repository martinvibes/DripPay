"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { features } from "@/lib/mock-data";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,229,160,0.04) 0%, transparent 70%)",
        }}
      />

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
            className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Privacy by{" "}
            <span className="gradient-text">Default</span>
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: EASE }}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.015)] p-8 transition-all duration-500 hover:border-[rgba(0,229,160,0.15)] hover:bg-[rgba(0,229,160,0.02)]"
            >
              {/* Hover gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(0,229,160,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Hover glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--accent)] opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-[0.08]" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(0,229,160,0.08)] transition-all duration-500 group-hover:bg-[rgba(0,229,160,0.15)] group-hover:shadow-[0_0_25px_rgba(0,229,160,0.12)]">
                  <feature.icon className="h-6 w-6 text-[var(--accent)]" />
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
