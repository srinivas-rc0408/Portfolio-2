/**
 * Inclusive month count between two dates (LinkedIn-style):
 *   Apr 2026 → May 2026 = 2 mos
 *   Nov 2025 → Apr 2026 = 6 mos
 *   Apr 2025 → May 2026 = 14 mos
 */
export function monthsBetween(start: Date, end: Date): number {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  return Math.max(1, months);
}

/** "1 mo" / "11 mos" / "1 yr" / "1 yr 2 mos" / "2 yrs 3 mos" */
export function formatMonths(months: number): string {
  if (months <= 0) return "0 mos";
  if (months < 12) return `${months} mo${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const yrPart = `${years} yr${years === 1 ? "" : "s"}`;
  if (rem === 0) return yrPart;
  return `${yrPart} ${rem} mo${rem === 1 ? "" : "s"}`;
}

/** Convenience: duration between start and end (defaults end to today). */
export function durationLabel(start: Date, end: Date = new Date()): string {
  return formatMonths(monthsBetween(start, end));
}
