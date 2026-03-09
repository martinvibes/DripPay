"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/animations";

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional icon displayed next to the title */
  icon?: React.ReactNode;
}

export function Modal({ onClose, title, children, icon }: ModalProps) {
  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-primary)] shadow-[0_0_0_1px_rgba(0,229,160,0.05),0_8px_60px_rgba(0,0,0,0.5),0_4px_40px_rgba(0,229,160,0.06)] max-h-[90vh] overflow-y-auto"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />

          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {icon}
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
              >
                <X className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>
            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
}
