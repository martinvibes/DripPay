import { Droplets } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md";
}

export function Logo({ size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconInner = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-lg" : "text-xl";
  const radius = size === "sm" ? "rounded-lg" : "rounded-xl";

  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div
        className={`relative flex ${iconSize} items-center justify-center ${radius} bg-[var(--accent)] transition-transform group-hover:scale-105`}
      >
        <Droplets
          className={`${iconInner} text-[var(--bg-deep)]`}
          strokeWidth={2.5}
        />
      </div>
      <span
        className={`${textSize} tracking-tight`}
        style={{ fontFamily: "var(--font-display), system-ui" }}
      >
        <span className="font-bold text-[var(--accent)]">Drip</span>
        <span className="font-bold text-[var(--text-primary)]">Pay</span>
      </span>
    </Link>
  );
}
