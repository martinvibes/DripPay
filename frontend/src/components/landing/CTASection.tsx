"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";
import { Star4, Star6, Diamond, CrossMark } from "@/components/shared/Stars";

export function CTASection() {
  return (
    <section className="section-padding relative">
      {/* Decorative elements */}
      <Star4 className="top-[15%] left-[8%]" size={20} opacity={0.14} pulse delay={0} />
      <Star4 className="bottom-[20%] right-[10%]" size={16} opacity={0.1} rotate delay={1.2} />
      <Star6 className="top-[10%] right-[12%]" size={18} opacity={0.08} rotate delay={0.5} />
      <CrossMark className="bottom-[15%] left-[12%]" size={10} opacity={0.1} rotate delay={2} />
      <Diamond className="top-[25%] right-[20%]" size={7} opacity={0.12} float delay={0.8} />
      <Diamond className="bottom-[25%] left-[18%]" size={6} opacity={0.1} pulse delay={1.5} />

      {/* Background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div className="accent-card rounded-2xl px-8 py-16 text-center md:px-16">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Privatize
              <br />
              <span className="gradient-text">Your Payroll?</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mb-8 max-w-md text-sm text-[var(--text-secondary)]"
            >
              Deploy your encrypted organization contract and start running
              private payroll in minutes.
            </motion.p>

            <motion.div variants={fadeUp} custom={2}>
              <Link href="/dashboard" className="btn-primary !py-3.5 !px-10 text-base">
                Launch App
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
