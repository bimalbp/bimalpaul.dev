import type { SalaryGroup } from "./types";

/** JSON shape the API returns for a group (also what the iOS app decodes). */
export function groupJSON(g: SalaryGroup, includeRecords: boolean) {
  return {
    key: g.key,
    company: { id: g.company.id, slug: g.company.slug, name: g.company.name },
    role: g.role,
    location: g.location,
    count: g.count,
    currency: g.currency,
    median: g.median,
    p25: g.p25,
    p75: g.p75,
    low: g.low,
    high: g.high,
    lastUpdated: g.lastUpdated,
    sourceTypes: g.sourceTypes,
    records: includeRecords
      ? g.records.map((r) => ({
          id: r.id,
          rawTitle: r.rawTitle,
          min: r.min,
          max: r.max,
          payPeriod: r.payPeriod,
          annualMin: r.annualMin,
          annualMax: r.annualMax,
          sourceType: r.sourceType,
          sourceUrl: r.sourceUrl,
          sourceRef: r.sourceRef ?? null,
          observedDate: r.observedDate,
        }))
      : undefined,
  };
}

export const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" };
