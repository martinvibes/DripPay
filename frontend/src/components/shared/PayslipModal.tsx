"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  Shield,
  FileText,
  ExternalLink,
  Eye,
  Printer,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { formatUnits } from "viem";
import { Modal } from "@/components/shared/Modal";
import { useFhevm } from "@/hooks/useFhevm";
import { useReadContract } from "wagmi";
import { ORGANIZATION_ABI } from "@/lib/contracts";

interface PayslipModalProps {
  onClose: () => void;
  orgAddress: `0x${string}`;
  orgName: string;
  txHash: string;
  blockNumber: bigint;
  tokenSymbol: string;
  tokenDecimals: number;
  /** "employee" shows salary decrypt, "employer" shows summary */
  mode: "employee" | "employer";
  /** For employee mode */
  employeeAddress?: `0x${string}`;
  /** For employer mode */
  employeeCount?: number;
}

const ETHERSCAN_URL = "https://sepolia.etherscan.io/tx";

export function PayslipModal({
  onClose,
  orgAddress,
  orgName,
  txHash,
  blockNumber,
  tokenSymbol,
  tokenDecimals,
  mode,
  employeeAddress,
  employeeCount,
}: PayslipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [salary, setSalary] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [printTheme, setPrintTheme] = useState<"dark" | "light">("dark");
  const [decryptError, setDecryptError] = useState("");

  const { decryptBalance, isReady } = useFhevm();

  // For employee mode - get salary handle
  const { data: salaryHandle } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "salaryOf",
    args: employeeAddress ? [employeeAddress] : undefined,
    query: { enabled: mode === "employee" && !!employeeAddress },
  });

  const handleDecryptSalary = useCallback(async () => {
    if (!isReady || !employeeAddress) return;
    setIsDecrypting(true);
    setDecryptError("");

    try {
      const handle = salaryHandle as `0x${string}`;
      if (
        !handle ||
        handle ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        setSalary("0");
        setIsDecrypting(false);
        return;
      }

      const result = await decryptBalance(handle, orgAddress);
      const raw = typeof result === "bigint" ? result : BigInt(String(result));
      const humanReadable = formatUnits(raw, tokenDecimals);
      const num = parseFloat(humanReadable);
      setSalary(
        num.toLocaleString(undefined, {
          minimumFractionDigits: num < 1 ? 6 : 2,
          maximumFractionDigits: num < 1 ? 6 : 2,
        }),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Decryption failed";
      setDecryptError(message);
    } finally {
      setIsDecrypting(false);
    }
  }, [
    isReady,
    employeeAddress,
    salaryHandle,
    decryptBalance,
    orgAddress,
    tokenDecimals,
  ]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const type = mode === "employee" ? "Payslip" : "Payroll Receipt";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DripPay ${type} - ${orgName}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          :root {
            --accent: #00e5a0;
            --text-main: ${printTheme === "dark" ? "#fafafa" : "#09090b"};
            --text-muted: ${printTheme === "dark" ? "#a1a1aa" : "#71717a"};
            --border: ${printTheme === "dark" ? "#27272a" : "#e4e4e7"};
            --bg-light: ${printTheme === "dark" ? "#18181b" : "#f4f4f5"};
            --bg-page: ${printTheme === "dark" ? "#09090b" : "#ffffff"};
            --bg-card: ${printTheme === "dark" ? "#0c0c10" : "#ffffff"};
            --border-card: ${printTheme === "dark" ? "#27272a" : "var(--text-main)"};
          }

          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-page);
            color: var(--text-main);
            line-height: 1.5;
          }

          .print-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }

          .payslip {
            border: 2px solid var(--border-card);
            border-radius: 0;
            background: var(--bg-card);
            position: relative;
            overflow: hidden;
            box-shadow: none;
          }

          .header {
            padding: 30px;
            border-bottom: 2px solid var(--border-card);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .brand {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: var(--accent);
            letter-spacing: -1px;
          }

          .doc-type {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--text-muted);
          }

          .badge-verified {
            font-size: 10px;
            font-weight: 700;
            padding: 4px 12px;
            border: 1px solid var(--accent);
            border-radius: 4px;
            color: #059669;
            background: #ecfdf5;
            text-transform: uppercase;
          }

          .content-body {
            padding: 40px;
          }

          .org-section {
            margin-bottom: 40px;
          }

          .org-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .org-title {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
          }

          .info-box {
            background: var(--bg-light);
            padding: 16px;
            border-radius: 8px;
          }

          .info-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .info-value {
            font-size: 14px;
            font-weight: 700;
            word-break: break-all;
          }

          .info-value.mono {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
          }

          .link-text {
            color: #059669;
            text-decoration: none;
            word-break: break-all;
          }

          .link-text:hover {
            text-decoration: underline;
          }

          .amount-section {
            margin-top: 40px;
            padding: 30px;
            border: 2px dashed var(--border);
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .amount-label {
            font-size: 16px;
            font-weight: 600;
          }

          .amount-value {
            font-size: 36px;
            font-weight: 800;
            color: var(--text-main);
          }

          .amount-currency {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-muted);
            margin-left: 8px;
          }

          .footer {
            padding: 30px;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-text {
            font-size: 10px;
            color: var(--text-muted);
          }

          .stamp {
            position: absolute;
            bottom: 60px;
            right: 40px;
            width: 100px;
            height: 100px;
            border: 4px solid rgba(0, 229, 160, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-15deg);
            opacity: 0.5;
            pointer-events: none;
          }

          .stamp-text {
            font-size: 12px;
            font-weight: 900;
            color: var(--accent);
            text-align: center;
            text-transform: uppercase;
          }

          @media print {
            body { background: white; }
            .print-container { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="payslip">
            <div class="header">
              <div class="brand">
                <span class="logo-text">DripPay</span>
                <span class="doc-type">${type}</span>
              </div>
              <div class="badge-verified">
                On-Chain Verified
              </div>
            </div>

            <div class="content-body">
              <div class="org-section">
                <div class="org-label">Organization</div>
                <div class="org-title">${orgName}</div>
              </div>

              <div class="grid">
                <div class="info-box">
                  <div class="info-label">Date Issued</div>
                  <div class="info-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Network</div>
                  <div class="info-value">Ethereum Sepolia</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Contract Address</div>
                  <div class="info-value mono">
                    <a href="https://sepolia.etherscan.io/address/${orgAddress}" class="link-text" target="_blank">${orgAddress}</a>
                  </div>
                </div>
                <div class="info-box">
                  <div class="info-label">Block Number</div>
                  <div class="info-value">#${blockNumber.toString()}</div>
                </div>
                ${
                  mode === "employee" && employeeAddress
                    ? `
                <div class="info-box" style="grid-column: span 2;">
                  <div class="info-label">Recipient Address</div>
                  <div class="info-value mono">
                    <a href="https://sepolia.etherscan.io/address/${employeeAddress}" class="link-text" target="_blank">${employeeAddress}</a>
                  </div>
                </div>
                `
                    : ""
                }
                ${
                  mode === "employer"
                    ? `
                <div class="info-box">
                  <div class="info-label">Employees Included</div>
                  <div class="info-value">${employeeCount || 0}</div>
                </div>
                `
                    : ""
                }
                <div class="info-box" style="grid-column: span 2;">
                  <div class="info-label">Transaction Hash</div>
                  <div class="info-value mono">
                    <a href="${ETHERSCAN_URL}/${txHash}" class="link-text" target="_blank">${txHash}</a>
                  </div>
                </div>
              </div>

              ${
                mode === "employee" && salary
                  ? `
              <div class="amount-section">
                <div class="amount-label">Net Salary Payment</div>
                <div class="amount-wrap">
                  <span class="amount-value">${salary}</span>
                  <span class="amount-currency">${tokenSymbol}</span>
                </div>
              </div>
              `
                  : mode === "employer"
                    ? `
              <div class="amount-section" style="background: #fafafa; border-style: solid;">
                <div class="amount-label">Payroll Execution Summary</div>
                <div class="amount-wrap">
                  <span class="amount-value" style="font-size: 24px;">CONFIRMED</span>
                </div>
              </div>
              `
                    : ""
              }
            </div>

            <div class="stamp">
              <div class="stamp-text">FHE<br>SECURED</div>
            </div>

            <div class="footer">
              <div class="footer-text">This is a system-generated document and does not require a physical signature. Verified on Ethereum Sepolia.</div>
              <div class="footer-text" style="font-weight: 600;">drip-payy.xyz</div>
            </div>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center; color: var(--text-muted); font-size: 12px;">
            Tip: For best results, enable "Background Graphics" in your printer settings.
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();

    // Give external fonts and styles a moment to load before triggering print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shortTx = txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : "";
  const shortOrg = `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`;
  const shortEmp = employeeAddress
    ? `${employeeAddress.slice(0, 6)}...${employeeAddress.slice(-4)}`
    : "";

  const modalIcon = (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted shadow-inner">
      <FileText className="h-5 w-5 text-accent" />
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      title={mode === "employee" ? "Official Payslip" : "Payroll Receipt"}
      icon={modalIcon}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Visual Receipt Card */}
        <div ref={printRef} className="relative overflow-hidden group">
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-linear-to-r from-accent to-emerald-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          <div className="relative payslip rounded-2xl border border-border-accent bg-[#0c0c14] overflow-hidden shadow-2xl">
            {/* Holographic line at top */}
            <div className="h-1 w-full bg-linear-to-r from-transparent via-accent to-transparent opacity-50"></div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-white/2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent shadow-[0_0_15px_rgba(0,229,160,0.3)]">
                  <Shield className="h-4 w-4 text-[#060608]" />
                </div>
                <span
                  className="logo text-xl font-black tracking-tighter text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  DRIP<span className="text-accent">PAY</span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80 mb-1">
                  Secure Protocol
                </span>
                <span className="badge flex items-center gap-1 rounded-md bg-accent-muted border border-border-accent px-2 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wider">
                  FHE VERIFIED
                </span>
              </div>
            </div>

            {/* Main Body */}
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mb-1">
                    {mode === "employee"
                      ? "Employee Payslip"
                      : "Payroll Summary"}
                  </h3>
                  <h2
                    className="text-2xl font-extrabold text-[#f0f0f2] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {orgName}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-text-muted font-medium">
                    TIMESTAMP
                  </p>
                  <p className="text-xs font-bold text-text-secondary">
                    {date}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors">
                  <span className="text-[9px] text-text-muted font-bold uppercase mb-1">
                    Network
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    Ethereum Sepolia
                  </span>
                </div>
                <div className="flex flex-col p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors">
                  <span className="text-[9px] text-text-muted font-bold uppercase mb-1">
                    Block Height
                  </span>
                  <span className="text-xs font-mono font-bold text-accent">
                    #{blockNumber.toString()}
                  </span>
                </div>
              </div>

              {/* Data Rows */}
              <div className="space-y-2.5">
                <div className="group/row flex items-center justify-between rounded-xl bg-white/2 border border-transparent hover:border-white/10 hover:bg-white/4 px-4 py-3 transition-all">
                  <span className="text-xs text-text-secondary font-medium flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-text-muted group-hover/row:bg-accent transition-colors"></div>
                    {mode === "employee" ? "Organization" : "Contract"}
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-primary">
                    {shortOrg}
                  </span>
                </div>

                {mode === "employee" && employeeAddress && (
                  <div className="group/row flex items-center justify-between rounded-xl bg-white/2 border border-transparent hover:border-white/10 hover:bg-white/4 px-4 py-3 transition-all">
                    <span className="text-xs text-text-secondary font-medium flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-text-muted group-hover/row:bg-accent transition-colors"></div>
                      Recipient
                    </span>
                    <span className="text-xs font-mono font-semibold text-text-primary">
                      {shortEmp}
                    </span>
                  </div>
                )}

                {mode === "employer" && employeeCount !== undefined && (
                  <div className="group/row flex items-center justify-between rounded-xl bg-white/2 border border-transparent hover:border-white/10 hover:bg-white/4 px-4 py-3 transition-all">
                    <span className="text-xs text-text-secondary font-medium flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-text-muted group-hover/row:bg-accent transition-colors"></div>
                      Recipient Count
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {employeeCount} Employees
                    </span>
                  </div>
                )}

                <div className="group/row flex items-center justify-between rounded-xl bg-white/2 border border-transparent hover:border-white/10 hover:bg-white/4 px-4 py-3 transition-all">
                  <span className="text-xs text-text-secondary font-medium flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-text-muted group-hover/row:bg-accent transition-colors"></div>
                    Transaction
                  </span>
                  <a
                    href={`${ETHERSCAN_URL}/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-hover transition-colors group/link"
                  >
                    {shortTx}
                    <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Prominent Salary/Status section */}
              {mode === "employee" && (
                <div className="relative mt-4 group/salary">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-accent to-emerald-500 rounded-2xl blur opacity-20 group-hover/salary:opacity-40 transition-opacity"></div>
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0e1614] p-8 transition-transform group-hover/salary:scale-[1.01]">
                    <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-3">
                      DISBURSED AMOUNT
                    </span>

                    <AnimatePresence mode="wait">
                      {salary ? (
                        <motion.div
                          key="revealed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-baseline gap-2"
                        >
                          <span
                            className="text-4xl font-black text-white tracking-tighter"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {salary}
                          </span>
                          <span className="text-lg font-bold text-accent">
                            {tokenSymbol}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="encrypted"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{
                            opacity: 0,
                            scale: 0.9,
                            filter: "blur(10px)",
                          }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="flex items-center gap-2">
                            {[...Array(6)].map((_, j) => (
                              <motion.span
                                key={j}
                                animate={{
                                  opacity: [0.3, 0.6, 0.3],
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: j * 0.15,
                                }}
                                className="h-7 w-3.5 rounded-full bg-accent/60 shadow-[0_0_8px_rgba(0,229,160,0.2)]"
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                            <Lock className="h-3 w-3" />
                            END-TO-END ENCRYPTED
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {mode === "employer" && (
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/2 p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 ring-1 ring-accent/20">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight mb-1">
                    System Verified
                  </h4>
                  <p className="text-xs text-text-secondary max-w-50 leading-relaxed mx-auto">
                    This transaction has been successfully confirmed and
                    verified on the Ethereum network.
                  </p>
                </div>
              )}
            </div>

            {/* Subtle Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/1 border-t border-white/5">
              <a
                href={`${ETHERSCAN_URL}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-text-muted tracking-widest uppercase hover:text-accent transition-colors"
              >
                ID: {txHash.slice(2, 10).toUpperCase()}
              </a>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-medium text-text-muted">
                  drip-payy.xyz
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                  ON-CHAIN
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          {mode === "employee" && !salary && (
            <button
              onClick={handleDecryptSalary}
              disabled={isDecrypting || !isReady}
              className="group relative w-full overflow-hidden rounded-xl bg-white/3 p-px transition-all hover:bg-white/5 disabled:opacity-50"
            >
              <div className="relative flex items-center justify-center gap-2 rounded-xl bg-[#09090b] px-6 py-4 text-sm font-bold text-white transition-all group-hover:bg-transparent">
                {isDecrypting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                      SECURE DECRYPTING...
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-accent" />
                    <span>REVEAL PAYSLIP DETAILS</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 -translate-x-full transition-transform group-hover:translate-x-0 bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
            </button>
          )}

          {decryptError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                {decryptError}
              </p>
            </div>
          )}

          {/* Theme toggle for PDF */}
          <div className="flex items-center justify-center gap-1 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-1">
            <button
              onClick={() => setPrintTheme("dark")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                printTheme === "dark"
                  ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)] border border-[rgba(0,229,160,0.2)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark PDF
            </button>
            <button
              onClick={() => setPrintTheme("light")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                printTheme === "light"
                  ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)] border border-[rgba(0,229,160,0.2)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Light PDF
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="group relative flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-sm font-bold text-[#060608] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_30px_rgba(0,229,160,0.2)]"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT / GENERATE PDF</span>
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </Modal>
  );
}
