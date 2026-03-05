export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-deep)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-[var(--text-secondary)]">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
