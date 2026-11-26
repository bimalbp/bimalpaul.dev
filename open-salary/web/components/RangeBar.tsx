import { moneyShort } from "@/lib/format";

/**
 * Low–high range as a thin line, the middle half (25th–75th percentile) as a band,
 * and the median as a tick. `scale` is shared across a result list so bars compare.
 */
export function RangeBar({
  low,
  high,
  p25,
  p75,
  median,
  scale,
  currency,
  showBand = true,
}: {
  low: number;
  high: number;
  p25: number;
  p75: number;
  median: number;
  scale: [number, number];
  currency: string;
  showBand?: boolean;
}) {
  const [s0, s1] = scale;
  const pos = (v: number) => `${(((v - s0) / Math.max(1, s1 - s0)) * 100).toFixed(2)}%`;
  const band = showBand ? `, middle half ${moneyShort(p25, currency)} to ${moneyShort(p75, currency)}` : "";
  const label = `Range ${moneyShort(low, currency)} to ${moneyShort(high, currency)}${band}, median ${moneyShort(median, currency)}`;
  return (
    <div className="rangebar" role="img" aria-label={label} title={label}>
      <div className="rb-line" style={{ left: pos(low), right: `calc(100% - ${pos(high)})` }} />
      {showBand && <div className="rb-band" style={{ left: pos(p25), right: `calc(100% - ${pos(p75)})` }} />}
      <div className="rb-median" style={{ left: pos(median) }} />
    </div>
  );
}

export function scaleFor(groups: { low: number; high: number }[]): [number, number] {
  if (groups.length === 0) return [0, 1];
  const lo = Math.min(...groups.map((g) => g.low));
  const hi = Math.max(...groups.map((g) => g.high));
  const pad = (hi - lo) * 0.04 || hi * 0.05;
  return [Math.max(0, lo - pad), hi + pad];
}
