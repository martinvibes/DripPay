"use client";

import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { steps } from "@/lib/mock-data";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-15%" });
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!isInView) return;

    // Sequentially light up each step as the line "reaches" it
    const timers: NodeJS.Timeout[] = [];
    steps.forEach((_, i) => {
      timers.push(
        setTimeout(() => setActiveStep(i), 600 + i * 700)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden">
      <div className="mx-auto max-w-[var(--max-width)] px-6" ref={sectionRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mb-20 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            How it Works
          </p>
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Four Steps to Private Payroll
          </h2>
        </motion.div>

        {/* Desktop Timeline (hidden on mobile) */}
        <div className="hidden lg:block">
          {/* Timeline track */}
          <div className="relative mx-auto" style={{ maxWidth: "960px" }}>
            {/* Background track line */}
            <div className="absolute left-0 right-0 top-[28px] h-[2px] bg-[var(--border)]" />

            {/* Animated green progress line */}
            <motion.div
              className="absolute left-0 top-[28px] h-[2px] origin-left"
              style={{ background: "var(--accent)" }}
              initial={{ scaleX: 0, width: "100%" }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 2.4, ease: EASE_OUT_EXPO, delay: 0.3 }}
            />

            {/* Glow trail on the animated line */}
            <motion.div
              className="absolute left-0 top-[24px] h-[10px] origin-left blur-[6px]"
              style={{ background: "var(--accent)", opacity: 0.4 }}
              initial={{ scaleX: 0, width: "100%" }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 2.4, ease: EASE_OUT_EXPO, delay: 0.3 }}
            />

            {/* Steps along the timeline */}
            <div className="relative grid grid-cols-4 gap-0">
              {steps.map((step, i) => {
                const isActive = activeStep >= i;

                return (
                  <div key={step.num} className="flex flex-col items-center text-center px-4">
                    {/* Circle node on timeline */}
                    <div className="relative mb-8">
                      {/* Outer pulse ring */}
                      <motion.div
                        className="absolute -inset-3 rounded-full"
                        style={{
                          border: `1.5px solid var(--accent)`,
                          opacity: 0,
                        }}
                        animate={
                          isActive
                            ? {
                                opacity: [0, 0.4, 0],
                                scale: [0.8, 1.4, 1.6],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          delay: i * 0.3,
                        }}
                      />

                      {/* Circle background */}
                      <motion.div
                        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2"
                        style={{
                          borderColor: isActive ? "var(--accent)" : "var(--border)",
                          background: isActive
                            ? "rgba(0, 229, 160, 0.1)"
                            : "var(--bg-primary)",
                        }}
                        animate={{
                          borderColor: isActive ? "var(--accent)" : "var(--border)",
                          background: isActive
                            ? "rgba(0, 229, 160, 0.1)"
                            : "var(--bg-primary)",
                          scale: isActive ? 1 : 0.9,
                        }}
                        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                      >
                        <step.icon
                          className="h-5 w-5 transition-colors duration-500"
                          style={{
                            color: isActive ? "var(--accent)" : "var(--text-muted)",
                          }}
                        />
                      </motion.div>

                      {/* Step number badge */}
                      <motion.span
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          fontFamily: "var(--font-display)",
                          background: isActive ? "var(--accent)" : "var(--border)",
                          color: isActive ? "var(--bg-primary)" : "var(--text-muted)",
                        }}
                        animate={{
                          background: isActive ? "var(--accent)" : "var(--border)",
                          color: isActive
                            ? "var(--bg-primary)"
                            : "var(--text-muted)",
                          scale: isActive ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      >
                        {step.num}
                      </motion.span>
                    </div>

                    {/* Text content */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 8 }}
                      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                    >
                      <h3
                        className="mb-2 text-base font-bold"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: isActive
                            ? "var(--text-secondary)"
                            : "var(--text-muted)",
                        }}
                      >
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet vertical timeline (visible below lg) */}
        <div className="lg:hidden">
          <div className="relative ml-6">
            {/* Vertical track */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--border)]" />

            {/* Animated vertical green line */}
            <motion.div
              className="absolute left-0 top-0 w-[2px] origin-top"
              style={{ background: "var(--accent)", height: "100%" }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 2.4, ease: EASE_OUT_EXPO, delay: 0.3 }}
            />

            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step, i) => {
                const isActive = activeStep >= i;

                return (
                  <div key={step.num} className="relative flex items-start gap-6 pl-8">
                    {/* Circle on vertical line */}
                    <motion.div
                      className="absolute -left-[15px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: isActive ? "var(--accent)" : "var(--border)",
                        background: isActive
                          ? "rgba(0, 229, 160, 0.15)"
                          : "var(--bg-primary)",
                      }}
                      animate={{
                        borderColor: isActive ? "var(--accent)" : "var(--border)",
                        background: isActive
                          ? "rgba(0, 229, 160, 0.15)"
                          : "var(--bg-primary)",
                      }}
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    >
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: isActive ? "var(--accent)" : "var(--text-muted)",
                        }}
                      >
                        {step.num}
                      </span>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 8 }}
                      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: isActive ? "rgba(0,229,160,0.3)" : "var(--border)",
                            background: isActive
                              ? "rgba(0, 229, 160, 0.08)"
                              : "var(--bg-card)",
                          }}
                        >
                          <step.icon
                            className="h-4 w-4"
                            style={{
                              color: isActive ? "var(--accent)" : "var(--text-muted)",
                            }}
                          />
                        </div>
                        <h3
                          className="text-base font-bold"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                          }}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: isActive
                            ? "var(--text-secondary)"
                            : "var(--text-muted)",
                        }}
                      >
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
