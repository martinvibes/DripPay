"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Loader2, Check, Wallet, ExternalLink } from "lucide-react";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { useERC20 } from "@/hooks/useERC20";
import { fadeUpSmall } from "@/lib/animations";

interface DepositCardProps {
  orgAddress: `0x${string}`;
  isETH: boolean;
  paymentToken?: `0x${string}`;
  contractBalance?: bigint;
  tokenSymbol?: string;
  tokenDecimals?: number;
  onDeposit: (amount: bigint, isETH: boolean) => void;
  isPending: boolean;
  txHash?: `0x${string}`;
  resetTx?: () => void;
  refetchBalance: () => void;
}

export function DepositCard({
  orgAddress,
  isETH,
  paymentToken,
  contractBalance,
  tokenSymbol,
  tokenDecimals = 18,
  onDeposit,
  isPending,
  txHash,
  resetTx,
  refetchBalance,
}: DepositCardProps) {
  const [amount, setAmount] = useState("");
  const [depositedAmount, setDepositedAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    approve,
    isApproving,
    allowance,
    refetchAllowance,
  } = useERC20(
    !isETH ? paymentToken : undefined,
    !isETH ? orgAddress : undefined,
  );

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  // Track tx confirmation
  useEffect(() => {
    if (isTxConfirmed && txHash && !isSuccess) {
      setIsSuccess(true);
      refetchBalance();
      if (!isETH) refetchAllowance();

      setTimeout(() => {
        setIsSuccess(false);
        setDepositedAmount("");
        resetTx?.();
      }, 3500);
    }
  }, [isTxConfirmed, txHash, isSuccess]);

  const parsedAmount = (() => {
    if (!amount || isNaN(Number(amount))) return BigInt(0);
    if (isETH) {
      return parseEther(amount);
    }
    return BigInt(Math.floor(Number(amount) * 10 ** tokenDecimals));
  })();

  const needsApproval = !isETH && allowance !== undefined && parsedAmount > BigInt(0) && allowance < parsedAmount;

  const formatBalance = (bal?: bigint) => {
    if (bal === undefined) return "—";
    if (isETH) {
      const eth = Number(bal) / 1e18;
      return eth.toFixed(eth < 0.01 ? 6 : 4);
    }
    const dec = tokenDecimals || 18;
    const val = Number(bal) / 10 ** dec;
    return val.toFixed(val < 0.01 ? 6 : 2);
  };

  const symbol = isETH ? "ETH" : tokenSymbol || "TOKEN";

  const isWaitingForConfirmation = !!txHash && !isTxConfirmed && !isSuccess;

  const handleDeposit = () => {
    if (parsedAmount <= BigInt(0)) return;
    setDepositedAmount(amount);
    onDeposit(parsedAmount, isETH);
    setAmount("");
  };

  const handleApprove = () => {
    if (parsedAmount <= BigInt(0)) return;
    approve(parsedAmount);
    setTimeout(() => refetchAllowance(), 3000);
  };

  const shortTx = txHash
    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    : "";

  return (
    <motion.div
      variants={fadeUpSmall}
      initial="hidden"
      animate="visible"
      className="stat-card group relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--accent)] opacity-0 blur-[30px] transition-opacity duration-500 group-hover:opacity-[0.08]" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] transition-colors group-hover:bg-[rgba(0,229,160,0.12)]">
            <Wallet className="h-5 w-5 text-[var(--accent)]" />
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-1">Contract Balance</p>
        <p
          className="text-lg sm:text-xl font-bold tracking-tight mb-1 truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatBalance(contractBalance)} <span className="text-xs sm:text-sm font-normal text-[var(--text-muted)]">{symbol}</span>
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mb-4">
          Available for employee withdrawals
        </p>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-3 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]"
              >
                <Check className="h-6 w-6 text-[var(--accent)]" />
              </motion.div>
              <p
                className="font-bold gradient-text text-base mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {depositedAmount} {symbol} Deposited
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Transaction confirmed
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  {shortTx}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="any"
                    min="0"
                    className="input-field !pr-16 text-sm"
                    disabled={isPending || isApproving || isWaitingForConfirmation}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-medium">
                    {symbol}
                  </div>
                </div>

                {/* Tx progress */}
                <AnimatePresence>
                  {(isPending || isWaitingForConfirmation) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-lg bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]" />
                          ) : (
                            <Check className="h-3 w-3 text-[var(--accent)]" />
                          )}
                          <span className={`text-[11px] ${!isPending ? "text-[var(--text-secondary)]" : "text-[var(--accent)]"}`}>
                            {isPending ? "Confirm in your wallet..." : "Wallet confirmed"}
                          </span>
                        </div>
                        {isWaitingForConfirmation && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]" />
                            <span className="text-[11px] text-[var(--accent)]">
                              Waiting for on-chain confirmation...
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {needsApproval ? (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || parsedAmount <= BigInt(0)}
                    className="btn-secondary w-full !py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Approve {symbol}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleDeposit}
                    disabled={isPending || isWaitingForConfirmation || parsedAmount <= BigInt(0)}
                    className="btn-primary w-full !py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Confirm in wallet...
                      </>
                    ) : isWaitingForConfirmation ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        Deposit {symbol}
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
