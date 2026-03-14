"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { DemoMode } from "@/components/shared/DemoMode";

const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "How it Works", href: "#how-it-works" },
];

export function Navbar() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
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
                key={item.label}
                href={item.href}
                className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => setShowDemo(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
            >
              <Play className="h-3 w-3" />
              Demo
            </button>
          </div>

          <WalletConnect />
        </div>

        <div className="h-px w-full bg-[var(--border)]" />
      </motion.nav>

      <DemoMode isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </>
  );
}
