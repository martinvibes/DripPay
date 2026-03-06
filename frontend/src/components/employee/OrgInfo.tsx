interface OrgInfoProps {
  orgName: string;
  orgAddress: string;
  tokenSymbol: string;
  createdDate?: string;
}

export function OrgInfo({
  orgName,
  orgAddress,
  tokenSymbol,
  createdDate,
}: OrgInfoProps) {
  return (
    <div className="glass-card p-6">
      <p className="text-xs text-[var(--text-muted)] mb-2">Organization</p>
      <p
        className="font-bold mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {orgName}
      </p>
      <p className="text-xs text-[var(--text-muted)] font-mono">
        {orgAddress}
      </p>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-xs text-[var(--accent)]">Connected</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Paying in {tokenSymbol}
        </p>
        {createdDate && (
          <p className="text-xs text-[var(--text-muted)]">
            Created {createdDate}
          </p>
        )}
      </div>
    </div>
  );
}
