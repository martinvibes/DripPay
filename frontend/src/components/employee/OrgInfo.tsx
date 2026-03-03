export function OrgInfo() {
  return (
    <div className="glass-card p-6 !hover:transform-none">
      <p className="text-xs text-[var(--text-muted)] mb-2">Organization</p>
      <p
        className="font-bold mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Acme Corp
      </p>
      <p className="text-xs text-[var(--text-muted)] font-mono">
        0x1234...5678
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        <span className="text-xs text-[var(--accent)]">Connected</span>
      </div>
    </div>
  );
}
