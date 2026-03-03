"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/mock-data";

export function StatsBar() {
  return (
    <section className="relative z-10 border-y border-[var(--border)] bg-[var(--bg-primary)]/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[var(--max-width)] flex-wrap items-center justify-center gap-4 px-6 py-7 md:justify-between">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 px-4 py-2"
          >
            <span
              className="text-2xl font-extrabold gradient-text md:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stat.value}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {stat.label}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {stat.sublabel}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
