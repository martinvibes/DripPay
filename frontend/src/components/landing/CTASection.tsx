"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

export function CTASection() {
  return (
    <section className="section-padding relative">
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="border-gradient glow-accent"
        >
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-[var(--bg-primary)] px-8 py-16 md:px-16">
            <motion.div
              variants={scaleIn}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]"
            >
              <ShieldCheck className="h-8 w-8 text-[var(--accent)]" />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Privatize
              <br />
              Your Payroll?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="max-w-md text-base text-[var(--text-secondary)]"
            >
              Deploy your encrypted organization contract and start running
              private payroll in minutes.
            </motion.p>

            <motion.div variants={fadeUp} custom={3}>
              <Link
                href="/dashboard"
                className="btn-primary !py-3.5 !px-10 text-base"
              >
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
