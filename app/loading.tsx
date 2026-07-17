import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Root route-transition fallback. Mirrors the two-pane app-shell so the layout
 * never jumps when the real page swaps in. On terminal routes the boot overlay
 * (z-999) covers this instantly; on other routes it's a clean themed skeleton.
 */
export default function Loading() {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-black"
      role="status"
      aria-label="Loading"
      aria-busy
    >
      {/* Left identity pane */}
      <aside className="hidden w-[30%] shrink-0 flex-col items-center gap-4 border-2 border-[rgba(var(--theme-accent-rgb),0.4)] p-6 min-[1025px]:flex">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <Skeleton className="mt-4 h-56 w-52 rounded-xl" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 w-full max-w-[280px] space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </aside>

      {/* Right terminal pane */}
      <main className="flex flex-1 flex-col gap-3 border-2 border-[rgba(var(--theme-accent-rgb),0.4)] p-6 min-[1025px]:border-l-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/3" />
      </main>
    </div>
  );
}
