"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowRight, Loader2, Check } from "lucide-react";

interface CreateOrgProps {
  onOrgCreated: (name: string) => void;
  isDeploying?: boolean;
}

export function CreateOrg({ onOrgCreated, isDeploying = false }: CreateOrgProps) {
  const [orgName, setOrgName] = useState("");

  const handleCreate = () => {
    if (!orgName.trim() || isDeploying) return;
    onOrgCreated(orgName.trim());
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full max-w-md"
      >
        <div className="border-gradient glow-accent">
          <div className="rounded-2xl bg-[var(--bg-primary)] p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
              <Building2 className="h-8 w-8 text-[var(--accent)]" />
            </div>

            <h2
              className="mb-2 text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Your Organization
            </h2>
            <p className="mb-8 text-sm text-[var(--text-secondary)]">
              Deploy an encrypted payroll contract onchain. All salary data
              will be protected by FHE.
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  disabled={isDeploying}
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={!orgName.trim() || isDeploying}
                className="btn-primary w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirm in wallet...
                  </>
                ) : (
                  <>
                    Deploy Organization
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Transaction pending indicator */}
              <AnimatePresence>
                {isDeploying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                        <span className="text-xs text-[var(--text-secondary)]">
                          Waiting for wallet confirmation and transaction...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isDeploying && (
                <p className="text-xs text-[var(--text-muted)] text-center">
                  This will deploy a new smart contract on Ethereum Sepolia
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
