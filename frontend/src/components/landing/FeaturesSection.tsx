"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { features } from "@/lib/mock-data";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative">
      {/* Decorative elements */}
      <Star4 className="top-[10%] right-[8%]" size={16} opacity={0.12} pulse delay={0.5} />
      <Star4 className="bottom-[15%] left-[6%]" size={12} opacity={0.1} rotate delay={1} />
      <CrossMark className="top-[20%] left-[10%]" size={10} opacity={0.08} rotate delay={2} />
      <Diamond className="bottom-[20%] right-[12%]" size={7} opacity={0.1} float delay={0.8} />
      <Dot className="top-[5%] left-[25%]" size={3} opacity={0.15} pulse delay={1.5} />
      <Dot className="bottom-[10%] right-[20%]" size={4} opacity={0.12} pulse delay={0.3} />

      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[var(--max-width)] px-6">
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
          className="grid gap-5 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i}
              className="glass-card group relative overflow-hidden p-8"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--accent)] opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-[0.08]" />

              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-muted)] transition-colors group-hover:bg-[rgba(0,229,160,0.12)]">
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
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
