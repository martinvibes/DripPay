"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Rocket,
  Building2,
  User,
  FileCode2,
  Lock,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Info,
  Lightbulb,
  Eye,
  CreditCard,
  FileText,
  Calculator,
  CalendarDays,
  FileDown,
  Search,
  Globe,
  Zap,
  PartyPopper,
  Layers,
  Copy,
  Check,
} from "lucide-react";

/* ─── Types ─── */
interface SidebarSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/* ─── Sidebar sections ─── */
const sections: SidebarSection[] = [
  { id: "getting-started", label: "Getting Started", icon: <Rocket className="w-4 h-4" /> },
  { id: "for-employers", label: "For Employers", icon: <Building2 className="w-4 h-4" /> },
  { id: "for-employees", label: "For Employees", icon: <User className="w-4 h-4" /> },
  { id: "smart-contracts", label: "Smart Contracts", icon: <FileCode2 className="w-4 h-4" /> },
  { id: "fhe-encryption", label: "FHE Encryption", icon: <Lock className="w-4 h-4" /> },
  { id: "features", label: "Features", icon: <Sparkles className="w-4 h-4" /> },
  { id: "use-cases", label: "Use Cases", icon: <Globe className="w-4 h-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
];

/* ─── Code Block Component ─── */
function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighting via spans
  const highlightSyntax = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, i) => {
      let highlighted = line
        // Comments
        .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
        // Strings
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>')
        // Keywords
        .replace(
          /\b(import|from|export|const|let|var|function|return|async|await|new|if|else|for|while|class|extends|implements|interface|type|enum|public|private|protected|static|readonly|void|null|undefined|true|false|pragma|solidity|contract|mapping|address|uint64|uint256|event|emit|require|msg|this|memory|storage|calldata|external|internal|view|pure|payable|returns)\b/g,
          '<span class="code-keyword">$1</span>'
        )
        // Functions
        .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="code-function">$1</span>')
        // Types / classes (capitalized words)
        .replace(/\b(TFHE|FHE|euint64|ebool|einput|bytes32|Organization|OrganizationFactory|GatewayCaller)\b/g, '<span class="code-type">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

      return (
        <div key={i} className="table-row">
          <span className="table-cell pr-4 text-right select-none" style={{ color: "var(--text-muted)", minWidth: 32, fontSize: 12 }}>
            {i + 1}
          </span>
          <span className="table-cell" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      );
    });
  };

  return (
    <div className="relative group rounded-xl border overflow-hidden my-4" style={{ background: "#0c0c10", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.015)" }}>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-sm" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace", lineHeight: 1.7 }}>
        <div className="table w-full">{highlightSyntax(code)}</div>
      </div>
      <style jsx>{`
        :global(.code-keyword) { color: #c792ea; }
        :global(.code-string) { color: #c3e88d; }
        :global(.code-comment) { color: #546e7a; font-style: italic; }
        :global(.code-function) { color: #82aaff; }
        :global(.code-type) { color: #ffcb6b; }
        :global(.code-number) { color: #f78c6c; }
      `}</style>
    </div>
  );
}

/* ─── Tip / Info box ─── */
function TipBox({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "tip" | "warning" }) {
  const styles = {
    info: { border: "var(--border-accent)", bg: "rgba(0,229,160,0.04)", icon: <Info className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} /> },
    tip: { border: "rgba(130,170,255,0.2)", bg: "rgba(130,170,255,0.04)", icon: <Lightbulb className="w-4 h-4 shrink-0" style={{ color: "#82aaff" }} /> },
    warning: { border: "rgba(255,203,107,0.2)", bg: "rgba(255,203,107,0.04)", icon: <Shield className="w-4 h-4 shrink-0" style={{ color: "#ffcb6b" }} /> },
  };
  const s = styles[variant];
  return (
    <div className="flex gap-3 rounded-xl px-4 py-3 my-4 text-sm" style={{ border: `1px solid ${s.border}`, background: s.bg, color: "var(--text-secondary)", lineHeight: 1.65 }}>
      <div className="mt-0.5">{s.icon}</div>
      <div>{children}</div>
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.h2
      id={id}
      className="text-2xl sm:text-3xl font-bold tracking-tight pt-8 pb-4 scroll-mt-24"
      style={{ fontFamily: "var(--font-display), system-ui" }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.h2>
  );
}

/* ─── Sub-heading ─── */
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-lg sm:text-xl font-semibold mt-8 mb-3 tracking-tight"
      style={{ fontFamily: "var(--font-display), system-ui", color: "var(--text-primary)" }}
    >
      {children}
    </h3>
  );
}

/* ─── Paragraph ─── */
function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base mb-4" style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
      {children}
    </p>
  );
}

/* ─── Bullet list with green checks ─── */
function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="space-y-2 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" style={{ color: "var(--accent)" }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Key function table ─── */
function FunctionTable({ rows }: { rows: { fn: string; desc: string }[] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Function</th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
              <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "var(--accent)", fontSize: 13 }}>{row.fn}</td>
              <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="font-medium text-sm sm:text-base" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>
          {question}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      className="glass-card p-4 sm:p-5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ background: "var(--accent-muted)" }}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>{title}</h4>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DOCS PAGE
   ═══════════════════════════════════════════ */
export default function DocsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ─── Intersection observer for active section tracking ─── */
  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the one closest to top
        const sorted = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveSection(sorted[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  }, []);

  /* ─── Sidebar content ─── */
  const SidebarContent = () => (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      <div className="px-3 mb-4">
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
          Documentation
        </span>
      </div>
      {sections.map((s) => {
        const isActive = activeSection === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative group text-left"
            style={{
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              background: isActive ? "var(--accent-muted)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="transition-colors" style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}>
              {s.icon}
            </span>
            {s.label}
          </button>
        );
      })}

      <div className="mt-8 mx-3 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="accent-card p-4">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>
            Ready to start?
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Launch the employer dashboard or employee portal.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="btn-primary text-xs !py-2 !px-3 text-center !rounded-lg">
              Employer Dashboard
            </Link>
            <Link href="/employee" className="btn-secondary text-xs !py-2 !px-3 text-center !rounded-lg">
              Employee Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-deep)" }}>
      {/* ─── Top bar ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 border-b"
        style={{ background: "rgba(6,6,8,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Docs</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to App
          </Link>
          <button
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" style={{ color: "var(--text-primary)" }} /> : <Menu className="w-4 h-4" style={{ color: "var(--text-primary)" }} />}
          </button>
        </div>
      </header>

      {/* ─── Mobile sidebar drawer ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 sm:hidden"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-14 left-0 bottom-0 z-40 w-[260px] overflow-y-auto sm:hidden"
              style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border)" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop sidebar ─── */}
      <aside
        className="hidden sm:block fixed top-14 left-0 bottom-0 w-[260px] overflow-y-auto"
        style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border)" }}
      >
        <SidebarContent />
      </aside>

      {/* ─── Main content ─── */}
      <main className="pt-14 sm:pl-[260px]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 pb-24">

          {/* ═══ GETTING STARTED ═══ */}
          <SectionHeading id="getting-started">
            <span className="gradient-text">Getting Started</span> with DripPay
          </SectionHeading>

          <SubHeading>What is DripPay?</SubHeading>
          <P>
            DripPay is a <strong style={{ color: "var(--text-primary)" }}>privacy-first on-chain payroll platform</strong> built on{" "}
            <strong style={{ color: "var(--text-primary)" }}>Fully Homomorphic Encryption (FHE)</strong>. It lets organizations run
            payroll entirely on-chain while keeping salary amounts, balances, and disbursements fully encrypted. Nobody can see what
            anyone earns — not even the blockchain itself.
          </P>
          <P>
            Built on Ethereum Sepolia with the Zama fhEVM coprocessor, DripPay performs real computations on encrypted data.
            Salaries are added, balances are updated, and budget checks are performed — all without ever decrypting the underlying values on-chain.
          </P>

          <SubHeading>How It Works</SubHeading>
          <P>The DripPay flow is straightforward:</P>
          <div className="my-4 flex flex-col gap-3">
            {[
              { step: "1", title: "Create Organization", desc: "Employer deploys a payroll smart contract, choosing ETH or ERC-20 payments." },
              { step: "2", title: "Add Employees", desc: "Enter wallet addresses and salary amounts. Salaries are encrypted client-side with FHE before touching the chain." },
              { step: "3", title: "Deposit Funds", desc: "Fund the contract with ETH or tokens to cover payroll." },
              { step: "4", title: "Run Payroll", desc: "One click triggers batch payment. All arithmetic happens on encrypted values." },
              { step: "5", title: "Employees Withdraw", desc: "Employees decrypt their balance with a wallet signature and withdraw real ETH/tokens." },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Number(item.step) * 0.05 }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-sm font-bold"
                  style={{ background: "var(--accent)", color: "var(--bg-deep)", fontFamily: "var(--font-display), system-ui" }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>{item.title}</p>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <SubHeading>Prerequisites</SubHeading>
          <BulletList
            items={[
              "A browser wallet (MetaMask, Rainbow, Coinbase Wallet, etc.)",
              "Sepolia ETH for gas fees and payroll funding",
              "A modern browser with JavaScript enabled (Chrome, Firefox, Brave, Edge)",
            ]}
          />

          <TipBox variant="tip">
            Need Sepolia ETH? Visit the{" "}
            <a
              href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Google Cloud Sepolia Faucet
            </a>{" "}
            or the{" "}
            <a
              href="https://www.alchemy.com/faucets/ethereum-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Alchemy Sepolia Faucet
            </a>{" "}
            to get free test ETH.
          </TipBox>

          <SubHeading>Quick Links</SubHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-4 rounded-xl border transition-all group"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.background = "var(--accent-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "var(--accent-muted)" }}>
                <Building2 className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Employer Dashboard</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Create orgs, run payroll</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "var(--text-muted)" }} />
            </Link>
            <Link
              href="/employee"
              className="flex items-center gap-3 p-4 rounded-xl border transition-all group"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.background = "var(--accent-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "var(--accent-muted)" }}>
                <User className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Employee Portal</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>View balance, withdraw</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "var(--text-muted)" }} />
            </Link>
          </div>

          {/* ─── Divider ─── */}
          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ FOR EMPLOYERS ═══ */}
          <SectionHeading id="for-employers">
            For <span className="gradient-text">Employers</span>
          </SectionHeading>
          <P>
            DripPay gives employers full control over private payroll operations. From creating an organization to exporting
            payment history, everything is designed to be simple while keeping salary data confidential.
          </P>

          <SubHeading>Creating an Organization</SubHeading>
          <P>
            Deploy a new payroll smart contract by clicking <strong style={{ color: "var(--text-primary)" }}>Create Organization</strong> on
            the employer dashboard. You will choose a name, select the payment currency (ETH or any ERC-20 token), and set
            a payroll cycle (weekly, bi-weekly, or monthly). A dedicated <code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>Organization</code> contract
            is deployed on Sepolia, and you become its admin.
          </P>

          <SubHeading>Adding Employees</SubHeading>
          <P>
            Enter each employee{"'"}s wallet address and their salary amount. The salary is encrypted client-side using
            Zama{"'"}s <code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>fhevmjs</code> library
            before the transaction is submitted. The plaintext salary never touches the blockchain.
          </P>
          <TipBox>
            Salaries are encrypted with FHE before leaving your browser. Even the RPC node and block explorers cannot see the amounts.
          </TipBox>

          <SubHeading>Depositing Funds</SubHeading>
          <P>
            Fund your organization{"'"}s contract with ETH or ERC-20 tokens. The contract balance must cover the total encrypted
            payroll before you can execute payments. A real-time USD estimate is shown based on current ETH prices.
          </P>

          <SubHeading>Running Payroll</SubHeading>
          <P>
            Trigger payroll with a single click. The contract iterates through all employees and performs encrypted addition
            on each balance:{" "}
            <code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>
              balance[emp] = FHE.add(balance[emp], salary[emp])
            </code>.
            All arithmetic happens on ciphertext — no values are ever revealed during execution.
          </P>

          <SubHeading>Revealing Salaries</SubHeading>
          <P>
            As an admin, you can perform a bulk decrypt of all employee salaries with a single wallet signature. This
            uses Zama{"'"}s re-encryption mechanism to decrypt values client-side, so you can review the payroll without
            exposing data on-chain.
          </P>

          <SubHeading>Updating Salaries</SubHeading>
          <P>
            Update any employee{"'"}s salary at any time. The new amount is re-encrypted with FHE and submitted as an
            encrypted input. The old ciphertext is replaced, and the change takes effect on the next payroll run.
          </P>

          <SubHeading>Budget Check</SubHeading>
          <P>
            Before running payroll, DripPay performs an FHE comparison between the contract balance and the total
            payroll cost. This check happens entirely on encrypted values — the contract verifies it has sufficient
            funds without revealing any amounts.
          </P>

          <SubHeading>Payroll Schedule</SubHeading>
          <P>
            Configure your payroll cycle to weekly, bi-weekly, or monthly. The dashboard shows upcoming payroll dates
            and sends reminders. While payroll execution is still manually triggered, the schedule helps you stay on track.
          </P>

          <SubHeading>Exporting History</SubHeading>
          <P>
            Export your complete payroll history as a PDF report or CSV spreadsheet. Exports include timestamps,
            employee counts, transaction hashes, and decrypted amounts (if you have previously revealed them).
          </P>

          <SubHeading>Payroll Receipts</SubHeading>
          <P>
            Each payroll event generates a receipt that can be viewed in the dashboard and printed as a PDF. Receipts
            include the organization name, date, employee count, total amount (encrypted or revealed), and
            the on-chain transaction hash.
          </P>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ FOR EMPLOYEES ═══ */}
          <SectionHeading id="for-employees">
            For <span className="gradient-text">Employees</span>
          </SectionHeading>
          <P>
            Employees interact with DripPay through a simple portal. Connect your wallet, view your encrypted balance,
            and withdraw real funds — all while keeping your salary completely private.
          </P>

          <SubHeading>Connecting Your Wallet</SubHeading>
          <P>
            When you connect your wallet, DripPay automatically discovers all organizations that have added your address
            as an employee. No setup required — just connect and go.
          </P>

          <SubHeading>Viewing Your Balance</SubHeading>
          <P>
            Your accumulated payroll balance is stored as an encrypted value on-chain. To view it, you sign a message
            with your wallet that authorizes client-side decryption. The decrypted balance is displayed only in your
            browser and is never sent anywhere.
          </P>
          <TipBox>
            Decryption happens entirely in your browser using your wallet signature. No server or third party ever sees your balance.
          </TipBox>

          <SubHeading>Withdrawing Funds</SubHeading>
          <P>
            Withdraw your accumulated balance as real ETH or ERC-20 tokens at any time. The contract decrements your
            encrypted balance and transfers the corresponding amount to your wallet. You can withdraw partial or full amounts.
          </P>

          <SubHeading>Transaction History</SubHeading>
          <P>
            View a complete history of all payroll credits and withdrawals associated with your address. Each entry
            shows the date, type (credit or withdrawal), amount (decryptable with your signature), and the transaction hash.
          </P>

          <SubHeading>Payslips</SubHeading>
          <P>
            Download encrypted payslips for each payroll cycle. Each payslip contains the organization name, pay period,
            and your encrypted salary amount. You can decrypt the salary directly on the payslip using your wallet
            signature, then save or print the document.
          </P>

          <SubHeading>Joining an Organization</SubHeading>
          <P>
            In most cases, organizations are automatically discovered when you connect your wallet. If an organization
            is not detected, you can manually join by entering its contract address. This is useful for newly deployed
            contracts that have not yet been indexed.
          </P>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ SMART CONTRACTS ═══ */}
          <SectionHeading id="smart-contracts">
            <span className="gradient-text">Smart Contracts</span>
          </SectionHeading>
          <P>
            DripPay{"'"}s on-chain layer consists of two core contracts deployed on Ethereum Sepolia, powered by Zama{"'"}s
            fhEVM coprocessor for encrypted computation.
          </P>

          <SubHeading>OrganizationFactory</SubHeading>
          <P>
            The factory contract is the entry point for creating new organizations. It deploys individual{" "}
            <code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>Organization</code> contract
            instances and maintains an index of all deployed organizations and their employees, enabling the auto-discovery feature.
          </P>

          <SubHeading>Organization</SubHeading>
          <P>
            Each organization is a standalone smart contract that manages its own employee list, encrypted salaries,
            encrypted balances, and payroll execution. All FHE operations (encrypted addition, comparison, and permission grants)
            happen within this contract.
          </P>

          <SubHeading>Key Functions</SubHeading>
          <FunctionTable
            rows={[
              { fn: "createOrg(name)", desc: "Deploy a new Organization contract via the factory" },
              { fn: "addEmployee(addr, encSalary)", desc: "Register an employee with an FHE-encrypted salary" },
              { fn: "removeEmployee(addr)", desc: "Remove an employee from the organization" },
              { fn: "updateSalary(addr, encSalary)", desc: "Update an employee's encrypted salary" },
              { fn: "deposit()", desc: "Fund the contract with ETH (payable)" },
              { fn: "runPayroll()", desc: "Execute batch payroll on all encrypted balances" },
              { fn: "withdraw(amount)", desc: "Employee withdraws accumulated funds" },
              { fn: "balanceOf(addr)", desc: "Returns the encrypted balance handle for an employee" },
              { fn: "budgetCheck()", desc: "FHE comparison: contract balance >= total payroll" },
              { fn: "revealSalary(addr)", desc: "Admin re-encrypts an employee's salary for viewing" },
            ]}
          />

          <SubHeading>Contract Addresses (Sepolia)</SubHeading>
          <P>
            The contracts are deployed on Ethereum Sepolia with the Zama fhEVM coprocessor. Key infrastructure addresses:
          </P>
          <div className="my-4 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "#0c0c10" }}>
            <div className="space-y-2 text-sm" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span style={{ color: "var(--text-muted)", minWidth: 100 }}>Zama ACL:</span>
                <span style={{ color: "var(--accent)", fontSize: 13 }}>0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span style={{ color: "var(--text-muted)", minWidth: 100 }}>Zama KMS:</span>
                <span style={{ color: "var(--accent)", fontSize: 13 }}>0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A</span>
              </div>
            </div>
          </div>

          <TipBox variant="warning">
            DripPay is a hackathon project and has not been audited. Do not use it with real funds on mainnet.
          </TipBox>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ FHE ENCRYPTION ═══ */}
          <SectionHeading id="fhe-encryption">
            <span className="gradient-text">FHE Encryption</span>
          </SectionHeading>

          <SubHeading>What is Fully Homomorphic Encryption?</SubHeading>
          <P>
            Fully Homomorphic Encryption (FHE) is a cryptographic technique that allows computation on encrypted data
            without decrypting it first. The results, when decrypted, are identical to performing the same operations
            on the plaintext. Think of it as doing math inside a locked box — you get the right answer without ever
            opening the box.
          </P>

          <SubHeading>How DripPay Uses FHE</SubHeading>
          <P>
            DripPay leverages Zama{"'"}s fhEVM, a coprocessor on Ethereum Sepolia that extends the EVM with FHE capabilities.
            The flow works in three stages:
          </P>
          <BulletList
            items={[
              <span key="1"><strong style={{ color: "var(--text-primary)" }}>Encrypt inputs:</strong> Salary amounts are encrypted client-side using fhevmjs before being sent to the contract.</span>,
              <span key="2"><strong style={{ color: "var(--text-primary)" }}>Compute on ciphertext:</strong> The smart contract performs arithmetic (add, compare) on encrypted values using Zama{"'"}s TFHE library.</span>,
              <span key="3"><strong style={{ color: "var(--text-primary)" }}>Decrypt outputs:</strong> Only authorized users (the employee or admin) can request re-encryption and decrypt values client-side.</span>,
            ]}
          />

          <SubHeading>Client-Side Encryption</SubHeading>
          <P>
            When an employer sets a salary, the plaintext amount never leaves the browser. The fhevmjs library encrypts it
            into an FHE-compatible ciphertext that can be processed by the Zama coprocessor:
          </P>
          <CodeBlock
            language="typescript"
            code={`import { createInstance } from "fhevmjs";

// Initialize the fhEVM instance
const instance = await createInstance({
  networkUrl: "https://devnet.zama.ai",
  gatewayUrl: "https://gateway.zama.ai",
});

// Encrypt a salary amount (e.g., 5000)
const input = instance.createEncryptedInput(
  contractAddress,
  userAddress
);
input.add64(salaryAmount);
const encrypted = input.encrypt();

// Send encrypted input to the smart contract
await contract.addEmployee(employeeAddress, encrypted);`}
          />

          <SubHeading>On-Chain Encrypted Math</SubHeading>
          <P>
            Inside the smart contract, all salary and balance operations use Zama{"'"}s TFHE library. The EVM never
            sees plaintext values:
          </P>
          <CodeBlock
            language="solidity"
            code={`import "fhevm/lib/TFHE.sol";

// Encrypted state variables
mapping(address => euint64) private balances;
mapping(address => euint64) private salaries;

// Run payroll: add encrypted salary to encrypted balance
function runPayroll(address[] memory employees) external {
    for (uint i = 0; i < employees.length; i++) {
        balances[employees[i]] = TFHE.add(
            balances[employees[i]],
            salaries[employees[i]]
        );
        TFHE.allow(balances[employees[i]], employees[i]);
    }
    emit PayrollExecuted(block.timestamp, employees.length);
}`}
          />

          <SubHeading>Client-Side Decryption</SubHeading>
          <P>
            When an employee wants to view their balance, they sign an EIP-712 message that authorizes the Zama
            gateway to re-encrypt the value with a key only they hold:
          </P>
          <CodeBlock
            language="typescript"
            code={`// Get the encrypted balance handle from the contract
const balanceHandle = await contract.balanceOf(userAddress);

// Generate a keypair for re-encryption
const { publicKey, privateKey } = instance.generateKeypair();

// Create and sign the EIP-712 authorization
const eip712 = instance.createEIP712(publicKey, contractAddress);
const signature = await signer.signTypedData(eip712);

// Decrypt the balance (happens entirely client-side)
const decryptedBalance = await instance.reencrypt(
  balanceHandle,
  privateKey,
  publicKey,
  signature,
  contractAddress,
  userAddress
);

console.log("Your balance:", decryptedBalance);`}
          />

          <SubHeading>Why FHE Over Other Privacy Tech?</SubHeading>
          <P>
            There are several approaches to blockchain privacy — here is why DripPay chose FHE:
          </P>
          <div className="overflow-x-auto my-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Approach</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Compute on Encrypted Data?</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>On-chain State?</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--accent)" }}>FHE (Zama)</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>Yes - full arithmetic</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>Yes - encrypted</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>ZK Proofs</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>No - only verification</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>Yes - committed</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>MPC</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>Yes - distributed</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>No - off-chain</td>
                </tr>
              </tbody>
            </table>
          </div>
          <P>
            FHE is uniquely suited for payroll because it allows the smart contract to <em>add encrypted salaries to
            encrypted balances</em> and <em>compare encrypted totals</em> — operations that ZK proofs and MPC
            cannot perform directly on-chain.
          </P>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ FEATURES ═══ */}
          <SectionHeading id="features">
            <span className="gradient-text">Features</span>
          </SectionHeading>
          <P>
            A comprehensive list of everything DripPay offers.
          </P>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
            <FeatureCard
              icon={<Shield className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Encrypted Salaries"
              desc="All salary amounts are FHE-encrypted before reaching the blockchain. No one can see what anyone earns."
            />
            <FeatureCard
              icon={<Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Batch Payroll"
              desc="Execute payroll for all employees in a single transaction. Encrypted addition across all balances."
            />
            <FeatureCard
              icon={<Search className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Employee Auto-Discovery"
              desc="Employees are automatically found when they connect their wallet. No manual configuration needed."
            />
            <FeatureCard
              icon={<CreditCard className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Salary Updates"
              desc="Re-encrypt and update any employee's salary at any time. Changes take effect next payroll cycle."
            />
            <FeatureCard
              icon={<Calculator className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Budget Check"
              desc="FHE comparison verifies the contract has sufficient funds without revealing any amounts."
            />
            <FeatureCard
              icon={<Eye className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Reveal All Salaries"
              desc="Admins can bulk-decrypt all salaries with a single wallet signature for review."
            />
            <FeatureCard
              icon={<FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Encrypted Payslips"
              desc="Employees download payslips with encrypted salary data and decrypt them client-side."
            />
            <FeatureCard
              icon={<FileDown className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Export History"
              desc="Export complete payroll history as PDF reports or CSV spreadsheets."
            />
            <FeatureCard
              icon={<Globe className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Multi-Currency USD Estimates"
              desc="Real-time USD value estimates for ETH balances and transaction costs."
            />
            <FeatureCard
              icon={<CalendarDays className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Payroll Scheduling"
              desc="Set weekly, bi-weekly, or monthly payroll cycles with upcoming date tracking."
            />
            <FeatureCard
              icon={<Zap className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Interactive Demo"
              desc="Try DripPay with mock data before deploying real contracts. Full end-to-end flow simulation."
            />
            <FeatureCard
              icon={<PartyPopper className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Confetti on Payroll"
              desc="Because running payroll should feel good. Celebratory confetti animation on successful execution."
            />
          </div>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ USE CASES ═══ */}
          <SectionHeading id="use-cases">
            Real-World <span className="gradient-text">Use Cases</span>
          </SectionHeading>
          <P>
            DripPay isn&apos;t just a hackathon demo - it solves real problems for real people across the globe. Here&apos;s who benefits most from confidential on-chain payroll.
          </P>

          <SubHeading>Emerging Markets with Capital Controls</SubHeading>
          <P>
            In countries like <strong>Argentina</strong> and <strong>Nigeria</strong>, strict capital controls make it difficult to receive international payments. Companies already pay contractors in crypto to bypass these limitations. But on a public blockchain, every payment is visible - exposing salary data to governments, competitors, and the public. DripPay encrypts these payments so companies can pay globally while keeping compensation private.
          </P>
          <TipBox variant="tip">
            Argentina has one of the highest crypto adoption rates in the world. Inflation above 200% drives demand for USD-denominated crypto payments. DripPay enables companies to pay Argentine contractors in ETH or stablecoins with full salary privacy.
          </TipBox>

          <SubHeading>Cross-Border Remote Teams</SubHeading>
          <P>
            Distributed teams across different countries face a dilemma: pay on-chain for speed and transparency, but expose everyone&apos;s salary to each other. A senior engineer in the US earning $15k/mo and a junior developer in Southeast Asia earning $2k/mo shouldn&apos;t have to know each other&apos;s compensation. DripPay lets companies pay everyone on the same chain with the same contract - while keeping individual amounts confidential.
          </P>

          <SubHeading>DAO Contributor Payments</SubHeading>
          <P>
            DAOs often pay contributors through public on-chain proposals. This means every community member can see what every contributor earns - leading to compensation disputes, politics, and talent loss. DripPay lets DAOs run payroll where the total budget is verifiable but individual payments are encrypted. The treasury multisig executes payroll, and only each contributor can see their own allocation.
          </P>

          <SubHeading>Freelancer and Contractor Payments</SubHeading>
          <P>
            Freelancers working with multiple clients don&apos;t want Client A to see what Client B pays them. On public blockchains, any client can look up the freelancer&apos;s wallet and see all incoming payments. DripPay ensures that each payment from each organization is encrypted independently - only the freelancer and that specific employer can see the amount.
          </P>

          <SubHeading>Compliance-Sensitive Industries</SubHeading>
          <P>
            Industries like finance, legal, and healthcare have strict rules about compensation privacy. Public blockchain payroll is a non-starter in these sectors. DripPay bridges this gap - salaries are on-chain (auditable, trustless, automated) but encrypted (private, compliant). This opens up on-chain payroll for industries that previously couldn&apos;t consider it.
          </P>

          <TipBox variant="info">
            Our roadmap includes <strong>Verifiable Income Proofs</strong> - employees will be able to generate ZK attestations proving their salary falls within a range (e.g., &quot;I earn above $X/month&quot;) without revealing the exact amount. This bridges FHE privacy with real-world needs like mortgage applications, visa proofs, and credit checks.
          </TipBox>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* ═══ FAQ ═══ */}
          <SectionHeading id="faq">
            Frequently Asked <span className="gradient-text">Questions</span>
          </SectionHeading>

          <div className="my-6">
            <FAQItem
              question="Is my salary really private?"
              answer={
                <span>
                  Yes. Your salary is encrypted using Fully Homomorphic Encryption before it is submitted to the blockchain.
                  The encrypted value is stored on-chain, and only you (and the organization admin) can decrypt it using a
                  wallet signature. Block explorers, other employees, and even the RPC nodes cannot see the plaintext amount.
                </span>
              }
            />
            <FAQItem
              question="Can my employer see my salary?"
              answer={
                <span>
                  Yes. The employer (organization admin) has <code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 5px", borderRadius: 4, fontSize: 13 }}>TFHE.allow</code> permission
                  on your salary ciphertext, which means they can request a re-encryption and decrypt it client-side. This is
                  by design — the employer needs to know what they are paying you. However, they cannot see other employees{"'"} salary
                  amounts unless they explicitly reveal them.
                </span>
              }
            />
            <FAQItem
              question="Can other employees see my salary?"
              answer={
                <span>
                  No. Each encrypted salary is permissioned so that only the individual employee and the admin can decrypt it.
                  Other employees have no access to your salary ciphertext{"'"}s decryption keys.
                </span>
              }
            />
            <FAQItem
              question="What blockchain is this on?"
              answer={
                <span>
                  DripPay runs on <strong style={{ color: "var(--text-primary)" }}>Ethereum Sepolia</strong> with the{" "}
                  <strong style={{ color: "var(--text-primary)" }}>Zama fhEVM coprocessor</strong>. Zama is not a separate chain —
                  it is a coprocessor that adds FHE capabilities to the existing Ethereum EVM. Your contracts deploy on
                  Sepolia and interact with Zama{"'"}s infrastructure for encrypted operations.
                </span>
              }
            />
            <FAQItem
              question="Is this audited?"
              answer={
                <span>
                  No. DripPay is a hackathon project built for the PL Genesis: Frontiers of Collaboration Hackathon. It has
                  not been professionally audited and should not be used with real funds on mainnet. Use it on Sepolia testnet only.
                </span>
              }
            />
            <FAQItem
              question="What tokens are supported?"
              answer={
                <span>
                  DripPay supports <strong style={{ color: "var(--text-primary)" }}>ETH</strong> (native Sepolia Ether) and{" "}
                  <strong style={{ color: "var(--text-primary)" }}>any ERC-20 token</strong>. When creating an organization, you
                  choose the payment currency. The contract handles both native ETH transfers and ERC-20 token transfers.
                </span>
              }
            />
            <FAQItem
              question="How do I get Sepolia ETH?"
              answer={
                <span>
                  You can get free Sepolia ETH from several faucets:
                  <br /><br />
                  <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="underline">Google Cloud Sepolia Faucet</a>
                  <br />
                  <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="underline">Alchemy Sepolia Faucet</a>
                  <br />
                  <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="underline">sepoliafaucet.com</a>
                </span>
              }
            />
          </div>

          {/* ─── Footer ─── */}
          <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="accent-card p-6 sm:p-8 text-center">
              <h3
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display), system-ui" }}
              >
                Ready to get <span className="gradient-text">started</span>?
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                Launch DripPay and experience private on-chain payroll.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/dashboard" className="btn-primary">
                  <Building2 className="w-4 h-4" />
                  Employer Dashboard
                </Link>
                <Link href="/employee" className="btn-secondary">
                  <User className="w-4 h-4" />
                  Employee Portal
                </Link>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Built with FHE by DripPay for PL Genesis: Frontiers of Collaboration Hackathon
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
