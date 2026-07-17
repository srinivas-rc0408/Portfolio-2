import React from "react";

/**
 * Base skeleton block — a pulsing, theme-tinted placeholder. Give it a width/
 * height via className. Uses Tailwind `animate-pulse` for a buttery, GPU-cheap
 * shimmer that matches the dark terminal / accent theme.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-[rgba(var(--theme-accent-rgb),0.10)] ${className}`}
    />
  );
}

/** One placeholder CMS entry card (admin list + public sections). */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-6 w-9" />
          <Skeleton className="h-6 w-8" />
        </div>
      </div>
    </div>
  );
}

/** A list of card skeletons (defaults to 3). */
export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-label="Loading entries" aria-busy>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <CardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/** One placeholder feedback row (admin inbox). */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
      <Skeleton className="h-4 w-4 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function RowSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-label="Loading feedback" aria-busy>
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
