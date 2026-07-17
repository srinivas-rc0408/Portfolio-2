import { Skeleton, CardSkeletonList } from "@/components/ui/Skeleton";

/**
 * Admin route-transition fallback — mirrors the sidebar + workspace shell so
 * navigating to /admin shows structure instead of a blank screen while the
 * session check and first data fetch run.
 */
export default function AdminLoading() {
  return (
    <div
      className="flex min-h-screen bg-black font-mono text-white"
      role="status"
      aria-label="Loading admin panel"
      aria-busy
    >
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col gap-2 border-r border-white/10 bg-black/40 p-4 md:flex">
        <Skeleton className="mb-4 h-6 w-32" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-lg" />
        ))}
      </aside>

      {/* Workspace */}
      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Skeleton className="h-72 w-full shrink-0 rounded-2xl lg:w-80" />
          <div className="min-w-0 flex-1">
            <CardSkeletonList count={4} />
          </div>
        </div>
      </main>
    </div>
  );
}
