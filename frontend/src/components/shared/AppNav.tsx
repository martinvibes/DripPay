import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";
import { Logo } from "./Logo";
import { WalletConnect } from "./WalletConnect";

interface AppNavProps {
  label: string;
  altLink: { href: string; label: string };
}

export function AppNav({ label, altLink }: AppNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-deep)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <div className="hidden h-5 w-px bg-[var(--border)] md:block" />
          <span className="hidden text-sm text-[var(--text-muted)] md:block">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={altLink.href}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.04)] transition-all duration-200"
          >
            <ArrowRightLeft className="h-3 w-3" />
            <span className="hidden sm:inline">{altLink.label}</span>
            <span className="sm:hidden">{altLink.label.replace(" View", "")}</span>
          </Link>
          <WalletConnect compact />
        </div>
      </div>
    </nav>
  );
}
