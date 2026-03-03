"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { WalletConnect } from "@/components/shared/WalletConnect";

const NAV_LINKS = ["Features", "How it Works", "Security"];

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-deep)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[var(--max-width)] items-center justify-between px-6 py-4">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            >
              {item}
            </a>
          ))}
        </div>

        <WalletConnect />
      </div>

      <div className="h-px w-full bg-[var(--border)]" />
    </motion.nav>
  );
}
