"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Calendar, Clock, AlertTriangle, Settings2, Check } from "lucide-react";

const STORAGE_KEY_PREFIX = "drippay_schedule_";

interface ScheduleData {
  intervalDays: number;
  lastRunTimestamp: number | null;
}

function getSchedule(orgAddress: string): ScheduleData {
  if (typeof window === "undefined") return { intervalDays: 30, lastRunTimestamp: null };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${orgAddress.toLowerCase()}`);
    return raw ? JSON.parse(raw) : { intervalDays: 30, lastRunTimestamp: null };
  } catch {
    return { intervalDays: 30, lastRunTimestamp: null };
  }
}

function saveSchedule(orgAddress: string, data: ScheduleData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgAddress.toLowerCase()}`, JSON.stringify(data));
}

const CYCLE_LABELS: Record<number, string> = {
  0: "One-time",
  7: "Weekly",
  14: "Bi-weekly",
  30: "Monthly",
};

interface PayrollScheduleCardProps {
  orgAddress: `0x${string}`;
  lastPayrollTimestampSec: number | null;
}

const ALL_CYCLES = [
  { label: "One-time", days: 0 },
  { label: "Weekly", days: 7 },
  { label: "Bi-weekly", days: 14 },
  { label: "Monthly", days: 30 },
];

export function PayrollScheduleCard({ orgAddress, lastPayrollTimestampSec }: PayrollScheduleCardProps) {
  const [schedule, setSchedule] = useState<ScheduleData>(() => getSchedule(orgAddress));
  const [now, setNow] = useState(Date.now());
  const [showCyclePicker, setShowCyclePicker] = useState(false);

  const handleChangeCycle = (days: number) => {
    const updated = { ...schedule, intervalDays: days };
    saveSchedule(orgAddress, updated);
    setSchedule(updated);
    setShowCyclePicker(false);
  };

  // Tick every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Sync on-chain last payroll timestamp
  useEffect(() => {
    if (lastPayrollTimestampSec) {
      const current = getSchedule(orgAddress);
      if (!current.lastRunTimestamp || lastPayrollTimestampSec * 1000 > current.lastRunTimestamp) {
        const updated = { ...current, lastRunTimestamp: lastPayrollTimestampSec * 1000 };
        saveSchedule(orgAddress, updated);
        setSchedule(updated);
      }
    }
  }, [lastPayrollTimestampSec, orgAddress]);

  const isOneTime = schedule.intervalDays === 0;
  const lastRun = schedule.lastRunTimestamp;
  const cycleLabel = CYCLE_LABELS[schedule.intervalDays] || `${schedule.intervalDays}d`;

  // For one-time, just show last run info
  if (isOneTime) {
    return (
      <div className="glass-card overflow-hidden !hover:transform-none">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
                <Calendar className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  Payroll Schedule
                </h3>
                <p className="text-[10px] text-[var(--text-muted)]">One-time (manual)</p>
              </div>
            </div>
            <CyclePicker
              current={schedule.intervalDays}
              show={showCyclePicker}
              onToggle={() => setShowCyclePicker(!showCyclePicker)}
              onChange={handleChangeCycle}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Clock className="h-3 w-3" />
            <span>
              Last run:{" "}
              {lastRun
                ? new Date(lastRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Never"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate next payroll and countdown for recurring
  const intervalMs = schedule.intervalDays * 24 * 60 * 60 * 1000;
  const nextPayrollMs = lastRun ? lastRun + intervalMs : null;

  let countdownText = "";
  let isOverdue = false;
  let statusColor = "text-[var(--text-muted)]";

  if (!lastRun) {
    countdownText = "Awaiting first run";
  } else if (nextPayrollMs) {
    const diff = nextPayrollMs - now;
    if (diff <= 0) {
      const overdueDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      const overdueHours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      isOverdue = true;
      statusColor = "text-red-400";
      countdownText = overdueDays > 0 ? `${overdueDays}d ${overdueHours}h overdue` : `${overdueHours}h overdue`;
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      statusColor = days <= 2 ? "text-yellow-400" : "text-[var(--accent)]";
      countdownText = days > 0 ? `in ${days}d ${hours}h` : `in ${hours}h`;
    }
  }

  const nextPayrollDate = nextPayrollMs
    ? new Date(nextPayrollMs).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const lastRunDate = lastRun
    ? new Date(lastRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="glass-card overflow-hidden !hover:transform-none">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
              <Calendar className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Payroll Schedule
              </h3>
              <p className="text-[10px] text-[var(--text-muted)]">{cycleLabel} cycle</p>
            </div>
          </div>
          <CyclePicker
            current={schedule.intervalDays}
            show={showCyclePicker}
            onToggle={() => setShowCyclePicker(!showCyclePicker)}
            onChange={handleChangeCycle}
          />
        </div>

        {/* Next payroll */}
        {nextPayrollDate ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-3 mb-3 ${
              isOverdue
                ? "bg-red-500/[0.06] border border-red-500/15"
                : "bg-[rgba(0,229,160,0.04)] border border-[rgba(0,229,160,0.1)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Next Payroll
              </span>
              {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {nextPayrollDate}
              </span>
              <span className={`text-xs font-semibold ${statusColor}`}>
                {countdownText}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[var(--border)] p-3 mb-3 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Run your first payroll to start the schedule
            </p>
          </div>
        )}

        {/* Last run info */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Last run: {lastRunDate || "Never"}</span>
          </div>
          <span>Every {schedule.intervalDays} days</span>
        </div>
      </div>
    </div>
  );
}

/** Inline cycle picker dropdown - uses portal to avoid overflow clipping */
function CyclePicker({
  current,
  show,
  onToggle,
  onChange,
}: {
  current: number;
  show: boolean;
  onToggle: () => void;
  onChange: (days: number) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (show && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
  }, [show]);

  // Close on outside click
  useEffect(() => {
    if (!show) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [show, onToggle]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={onToggle}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] hover:border-[var(--border-accent)] hover:bg-[rgba(0,229,160,0.04)] transition-all"
        title="Change payroll cycle"
      >
        <Settings2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
      </button>
      {mounted && createPortal(
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
              className="w-36 rounded-xl border border-[var(--border-accent)] bg-[var(--bg-primary)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              <div className="p-1">
                {ALL_CYCLES.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => onChange(opt.days)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      current === opt.days
                        ? "text-[var(--accent)] bg-[rgba(0,229,160,0.06)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.04)]"
                    }`}
                  >
                    {opt.label}
                    {current === opt.days && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
