import Link from "next/link";
import { Logo } from "./Logo";

interface AppNavProps {
  label: string;
  altLink: { href: string; label: string };
  walletAddress?: string;
}

export function AppNav({
  label,
  altLink,
  walletAddress = "0x7a3...f92e",
}: AppNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-deep)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <div className="hidden h-5 w-px bg-[var(--border)] md:block" />
          <span className="hidden text-sm text-[var(--text-muted)] md:block">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={altLink.href}
            className="hidden text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors md:block"
          >
            {altLink.label}
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
              {walletAddress}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
