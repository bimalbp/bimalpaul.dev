/** Linear-interpolated percentile of an ascending-sorted array (p in 0..1). */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function summarize(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    median: Math.round(percentile(sorted, 0.5)),
    p25: Math.round(percentile(sorted, 0.25)),
    p75: Math.round(percentile(sorted, 0.75)),
    low: sorted[0] ?? 0,
    high: sorted[sorted.length - 1] ?? 0,
  };
}
