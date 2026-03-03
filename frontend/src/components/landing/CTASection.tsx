"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";

export function CTASection() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-[var(--max-width)] px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Privatize Your Payroll?
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
            <Link href="/dashboard" className="btn-primary !py-3 !px-8">
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
