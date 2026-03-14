"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { stats } from "@/lib/mock-data";

/**
 * Parses a stat value like "100%", "0", "FHE", "1-Click" and returns
 * the numeric portion (if any), plus prefix/suffix strings.
 */
function parseStatValue(value: string): {
  prefix: string;
  number: number | null;
  suffix: string;
} {
  const match = value.match(/^([^\d]*?)(\d+)(.*)$/);
  if (match) {
    return {
      prefix: match[1],
      number: parseInt(match[2], 10),
      suffix: match[3],
    };
  }
  return { prefix: value, number: null, suffix: "" };
}

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(0);
  const parsed = parseStatValue(value);

  const startAnimation = useCallback(() => {
    if (hasAnimated || parsed.number === null) return;
    setHasAnimated(true);

    const target = parsed.number;
    const duration = 1600; // ms
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNumber(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [hasAnimated, parsed.number]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startAnimation]);

  // Non-numeric values just display as-is with a fade
  if (parsed.number === null) {
    return (
      <span ref={ref} className="gradient-text">
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className="gradient-text tabular-nums">
      {parsed.prefix}
      {hasAnimated ? displayNumber : 0}
      {parsed.suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative z-10 border-y border-[var(--border)] bg-[var(--bg-primary)]/60 backdrop-blur-sm">
      {/* Green accent line on top */}
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      {/* Subtle glow beneath the accent line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,229,160,0.04) 0%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex max-w-[var(--max-width)] flex-wrap items-center justify-center gap-4 px-6 py-8 md:justify-between">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.08,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="flex items-center gap-4 px-4 py-2"
          >
            <span
              className="text-2xl font-extrabold md:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <AnimatedValue value={stat.value} />
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
