import Link from "next/link";
import { Logo } from "./Logo";
import { WalletConnect } from "./WalletConnect";

interface AppNavProps {
  label: string;
  altLink: { href: string; label: string };
}

export function AppNav({ label, altLink }: AppNavProps) {
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
            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {altLink.label}
          </Link>
          <WalletConnect compact />
        </div>
      </div>
    </nav>
  );
}
