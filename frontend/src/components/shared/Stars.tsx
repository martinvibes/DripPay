"use client";

import { motion } from "framer-motion";

/* ───────────────────────────────────────────
   Decorative star / sparkle SVGs
   All are pointer-events-none + absolute positioned
   ─────────────────────────────────────────── */

interface StarProps {
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
  /** Slow rotation animation */
  rotate?: boolean;
  /** Gentle pulse animation */
  pulse?: boolean;
  /** Float up/down animation */
  float?: boolean;
  /** Animation delay in seconds */
  delay?: number;
}

/** 4-point sparkle star ✦ */
export function Star4({
  className = "",
  size = 16,
  color = "var(--accent)",
  opacity = 0.15,
  rotate,
  pulse,
  float,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={{
        ...(rotate ? { rotate: [0, 360] } : {}),
        ...(pulse ? { opacity: [opacity * 0.5, opacity, opacity * 0.5] } : {}),
        ...(float ? { y: [0, -6, 0] } : {}),
      }}
      transition={{
        duration: rotate ? 20 : pulse ? 4 : 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
    </motion.svg>
  );
}

/** 6-point star / asterisk ✳ */
export function Star6({
  className = "",
  size = 20,
  color = "var(--accent)",
  opacity = 0.1,
  rotate,
  pulse,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={{
        ...(rotate ? { rotate: [0, 180] } : {}),
        ...(pulse ? { opacity: [opacity * 0.4, opacity, opacity * 0.4] } : {}),
      }}
      transition={{
        duration: rotate ? 30 : 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <path d="M12 0L13.5 8.5L20.5 3.5L15.5 10.5L24 12L15.5 13.5L20.5 20.5L13.5 15.5L12 24L10.5 15.5L3.5 20.5L8.5 13.5L0 12L8.5 10.5L3.5 3.5L10.5 8.5L12 0Z" />
    </motion.svg>
  );
}

/** Small cross / plus + */
export function CrossMark({
  className = "",
  size = 12,
  color = "var(--accent)",
  opacity = 0.12,
  rotate,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={rotate ? { rotate: [0, 90] } : {}}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <rect x="5" y="0" width="2" height="12" rx="1" fill={color} />
      <rect x="0" y="5" width="12" height="2" rx="1" fill={color} />
    </motion.svg>
  );
}

/** Small diamond ◆ */
export function Diamond({
  className = "",
  size = 8,
  color = "var(--accent)",
  opacity = 0.12,
  pulse,
  float,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill={color}
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={{
        ...(pulse ? { opacity: [opacity * 0.4, opacity, opacity * 0.4] } : {}),
        ...(float ? { y: [0, -4, 0] } : {}),
      }}
      transition={{
        duration: pulse ? 3.5 : 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <path d="M5 0L10 5L5 10L0 5Z" />
    </motion.svg>
  );
}

/** Small circle dot */
export function Dot({
  className = "",
  size = 4,
  color = "var(--accent)",
  opacity = 0.2,
  pulse,
  delay = 0,
}: StarProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        opacity,
      }}
      animate={pulse ? { opacity: [opacity * 0.3, opacity, opacity * 0.3] } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/** A cluster of 3 small dots in a triangle pattern */
export function DotCluster({
  className = "",
  size = 3,
  color = "var(--accent)",
  opacity = 0.15,
  delay = 0,
}: StarProps) {
  return (
    <div className={`pointer-events-none absolute ${className}`} style={{ opacity }}>
      <Dot size={size} color={color} opacity={1} pulse delay={delay} className="relative" />
      <Dot size={size} color={color} opacity={1} pulse delay={delay + 0.5} className="!absolute top-0 left-3" />
      <Dot size={size * 0.8} color={color} opacity={0.7} pulse delay={delay + 1} className="!absolute top-2.5 left-1.5" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Employee page — encryption-themed shapes
   ═══════════════════════════════════════════ */

/** Hexagon outline — represents encryption blocks */
export function Hexagon({
  className = "",
  size = 32,
  color = "var(--accent)",
  opacity = 0.1,
  rotate,
  pulse,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={{
        ...(rotate ? { rotate: [0, 60] } : {}),
        ...(pulse ? { opacity: [opacity * 0.4, opacity, opacity * 0.4] } : {}),
      }}
      transition={{
        duration: rotate ? 25 : 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <polygon
        points="16,1 29.8,8.5 29.8,23.5 16,31 2.2,23.5 2.2,8.5"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
    </motion.svg>
  );
}

/** Concentric ring — expanding security ripple */
export function Ring({
  className = "",
  size = 40,
  color = "var(--accent)",
  opacity = 0.08,
  pulse,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={
        pulse
          ? { opacity: [opacity * 0.3, opacity, opacity * 0.3], scale: [0.95, 1.05, 0.95] }
          : {}
      }
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="0.8" />
      <circle cx="20" cy="20" r="12" fill="none" stroke={color} strokeWidth="0.6" opacity="0.6" />
      <circle cx="20" cy="20" r="6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
    </motion.svg>
  );
}

/** Shield outline — security symbol */
export function ShieldShape({
  className = "",
  size = 24,
  color = "var(--accent)",
  opacity = 0.1,
  pulse,
  float,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 28"
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={{
        ...(pulse ? { opacity: [opacity * 0.4, opacity, opacity * 0.4] } : {}),
        ...(float ? { y: [0, -5, 0] } : {}),
      }}
      transition={{
        duration: pulse ? 4 : 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <path
        d="M12 1L2 6V13C2 19.6 6.2 25.6 12 27C17.8 25.6 22 19.6 22 13V6L12 1Z"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
    </motion.svg>
  );
}

/** Lock keyhole shape */
export function KeyHole({
  className = "",
  size = 18,
  color = "var(--accent)",
  opacity = 0.1,
  pulse,
  delay = 0,
}: StarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 20 24"
      className={`pointer-events-none absolute ${className}`}
      style={{ opacity }}
      animate={pulse ? { opacity: [opacity * 0.4, opacity, opacity * 0.4] } : {}}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <rect x="2" y="10" width="16" height="12" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="10" cy="8" r="5" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="10" cy="15" r="1.5" fill={color} opacity="0.5" />
    </motion.svg>
  );
}

/** Binary block — small 0/1 text element */
export function BinaryBlock({
  className = "",
  opacity = 0.06,
  delay = 0,
}: StarProps) {
  const bits = "01101001";
  return (
    <motion.div
      className={`pointer-events-none absolute font-mono text-[9px] leading-tight text-[var(--accent)] select-none ${className}`}
      style={{ opacity }}
      animate={{ opacity: [opacity * 0.4, opacity, opacity * 0.4] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {bits.slice(0, 4)}
      <br />
      {bits.slice(4)}
    </motion.div>
  );
}
