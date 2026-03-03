"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const NAV_LINKS = ["Features", "How it Works", "Security"];

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto flex max-w-[var(--max-width)] items-center justify-between px-6 py-5">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              {item}
            </a>
          ))}
        </div>

        <Link href="/dashboard" className="btn-primary text-sm !py-2.5 !px-5">
          Launch App
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
    </motion.nav>
  );
}
