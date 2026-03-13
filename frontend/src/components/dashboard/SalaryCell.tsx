"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { useFhevm } from "@/hooks/useFhevm";

interface SalaryCellProps {
  employeeAddress: `0x${string}`;
  orgAddress: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
  compact?: boolean;
}

export function SalaryCell({
  employeeAddress,
  orgAddress,
  tokenSymbol = "ETH",
  tokenDecimals = 18,
  compact = false,
}: SalaryCellProps) {
  const [revealed, setRevealed] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [salary, setSalary] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { decryptBalance, isReady } = useFhevm();

  const { data: salaryHandle, refetch: refetchHandle } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "salaryOf",
    args: [employeeAddress],
    query: { enabled: !!orgAddress && !!employeeAddress },
  });

  const handleToggle = async () => {
    if (revealed) {
      setRevealed(false);
      setSalary(null);
      return;
    }

    if (!isReady) {
      setError("Connect wallet first");
      return;
    }

    setDecrypting(true);
    setError("");

    try {
      const { data: freshHandle } = await refetchHandle();
      const handle = (freshHandle ?? salaryHandle) as `0x${string}`;

      if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setSalary("0");
        setRevealed(true);
        setDecrypting(false);
        return;
      }

      const result = await decryptBalance(handle, orgAddress);
      const raw = typeof result === "bigint" ? result : BigInt(String(result));
      const humanReadable = formatUnits(raw, tokenDecimals);
      const num = parseFloat(humanReadable);
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: num < 1 ? 6 : 2,
        maximumFractionDigits: num < 1 ? 6 : 2,
      });
      setSalary(formatted);
      setRevealed(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Decryption failed";
      console.error("[SalaryCell] Decrypt error:", err);
      setError(message);
    } finally {
      setDecrypting(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={decrypting}
        className="flex items-center gap-1.5 group"
      >
        <AnimatePresence mode="wait">
          {decrypting ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]" />
              <span className="text-[11px] text-[var(--accent)]">Decrypting</span>
            </motion.div>
          ) : revealed && salary ? (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <span className="text-[11px] font-mono font-medium text-[var(--accent)]">
                {salary}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">{tokenSymbol}</span>
              <EyeOff className="h-2.5 w-2.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ) : (
            <motion.div
              key="encrypted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span
                    key={j}
                    className="inline-block h-3 w-1.5 rounded-sm bg-[var(--accent)] opacity-25"
                  />
                ))}
              </div>
              <Lock className="h-3 w-3 text-[var(--text-muted)]" />
              <Eye className="h-2.5 w-2.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <span className="text-[10px] text-red-400 ml-1" title={error}>!</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={decrypting}
      className="flex items-center gap-2 group transition-colors"
    >
      <AnimatePresence mode="wait">
        {decrypting ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)]">Decrypting...</span>
          </motion.div>
        ) : revealed && salary ? (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <span className="text-sm font-mono font-semibold text-[var(--accent)]">
              {salary}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{tokenSymbol}</span>
            <EyeOff className="h-3 w-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
          </motion.div>
        ) : (
          <motion.div
            key="encrypted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <span
                  key={j}
                  className="inline-block h-3 w-1.5 rounded-sm bg-[var(--accent)] opacity-25"
                />
              ))}
            </div>
            <Lock className="h-3 w-3 text-[var(--text-muted)]" />
            <Eye className="h-3 w-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <span className="text-[10px] text-red-400" title={error}>Failed</span>
      )}
    </button>
  );
}
