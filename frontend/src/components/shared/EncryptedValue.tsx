"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface EncryptedValueProps {
  bars?: number;
  barHeight?: string;
  barWidth?: string;
  animated?: boolean;
  showLock?: boolean;
}

export function EncryptedValue({
  bars = 5,
  barHeight = "h-3",
  barWidth = "w-1.5",
  animated = false,
  showLock = true,
}: EncryptedValueProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[...Array(bars)].map((_, j) =>
          animated ? (
            <motion.span
              key={j}
              animate={{ opacity: [0.15, 0.5, 0.15] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: j * 0.15,
              }}
              className={`inline-block ${barHeight} ${barWidth} rounded-sm bg-[var(--accent)]`}
              style={{ opacity: 0.15 }}
            />
          ) : (
            <span
              key={j}
              className={`inline-block ${barHeight} ${barWidth} rounded-sm bg-[var(--accent)] opacity-25`}
            />
          )
        )}
      </div>
      {showLock && <Lock className="h-3 w-3 text-[var(--text-muted)]" />}
    </div>
  );
}
