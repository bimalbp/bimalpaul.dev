import { summarize } from "./stats";
import type { Company, Dataset, Role, SalaryGroup, SalaryRecord } from "./types";

/**
 * In-memory index over a Dataset. Fine for the PoC (a quarter of LCA data is a
 * few hundred thousand rows); swap for Postgres full-text search later.
 */
export class SalaryIndex {
  readonly companies = new Map<string, Company>();
  readonly companiesBySlug = new Map<string, Company>();
  readonly roles = new Map<string, Role>();
  private groups: SalaryGroup[];
  private haystack: string[];

  constructor(readonly dataset: Dataset) {
    for (const c of dataset.companies) {
      this.companies.set(c.id, c);
      this.companiesBySlug.set(c.slug, c);
    }
    for (const r of dataset.roles) this.roles.set(r.id, r);
    this.groups = this.buildGroups(dataset.records);
    this.haystack = this.groups.map((g) =>
      fold(
        [g.company.name, ...g.company.aliases, g.role.title, g.role.level ?? "", g.role.function ?? "", ...new Set(g.records.map((r) => r.rawTitle))].join(" "),
      ),
    );
  }

  private buildGroups(records: SalaryRecord[]): SalaryGroup[] {
    const buckets = new Map<string, SalaryRecord[]>();
    for (const r of records) {
      const key = `${r.companyId}|${r.roleId}|${r.city}|${r.state}|${r.currency}`;
      const list = buckets.get(key);
      if (list) list.push(r);
      else buckets.set(key, [r]);
    }
    const groups: SalaryGroup[] = [];
    for (const [key, recs] of buckets) {
      const first = recs[0];
      const company = this.companies.get(first.companyId);
      const role = this.roles.get(first.roleId);
      if (!company || !role) continue;
      // Median and quartiles use each record's midpoint; low/high span the full ranges.
      const mids = recs.map((r) => (r.annualMin + r.annualMax) / 2);
      const s = summarize(mids);
      recs.sort((a, b) => b.observedDate.localeCompare(a.observedDate));
      groups.push({
        key,
        company,
        role,
        location: formatLocation(first.city, first.state),
        count: recs.length,
        median: s.median,
        p25: s.p25,
        p75: s.p75,
        low: Math.min(...recs.map((r) => r.annualMin)),
        high: Math.max(...recs.map((r) => r.annualMax)),
        currency: first.currency,
        lastUpdated: recs[0].observedDate,
        sourceTypes: [...new Set(recs.map((r) => r.sourceType))],
        records: recs,
      });
    }
    return groups;
  }

  search(opts: { q?: string; city?: string; limit?: number }): { total: number; groups: SalaryGroup[] } {
    const tokens = fold(opts.q ?? "").split(/\s+/).filter(Boolean);
    const city = fold(opts.city ?? "").trim();
    const limit = clamp(opts.limit ?? 50, 1, 200);
    if (tokens.length === 0 && !city) return { total: 0, groups: [] };

    const scored: { g: SalaryGroup; score: number }[] = [];
    this.groups.forEach((g, i) => {
      if (city && !fold(g.location).includes(city)) return;
      const hay = this.haystack[i];
      if (!tokens.every((t) => hay.includes(t))) return;
      const q = tokens.join(" ");
      let score = Math.log2(1 + g.count);
      if (q && fold(g.company.name) === q) score += 20;
      else if (q && fold(g.company.name).startsWith(q)) score += 10;
      if (q && fold(g.role.title) === q) score += 8;
      scored.push({ g, score });
    });
    scored.sort((a, b) => b.score - a.score || b.g.median - a.g.median);
    return { total: scored.length, groups: scored.slice(0, limit).map((s) => s.g) };
  }

  company(slug: string): { company: Company; groups: SalaryGroup[] } | null {
    const company = this.companiesBySlug.get(slug);
    if (!company) return null;
    const groups = this.groups
      .filter((g) => g.company.id === company.id)
      .sort((a, b) => a.role.title.localeCompare(b.role.title) || b.median - a.median);
    return { company, groups };
  }

  /** Company names for autocomplete; an empty prefix lists companies A–Z. */
  suggest(prefix: string, limit = 8): Company[] {
    const p = fold(prefix).trim();
    if (!p) return this.dataset.companies.slice(0, limit);
    const out: Company[] = [];
    for (const c of this.companies.values()) {
      if ([c.name, ...c.aliases].some((n) => fold(n).startsWith(p))) out.push(c);
      if (out.length >= limit) break;
    }
    return out;
  }

  stats() {
    return {
      companies: this.dataset.companies.length,
      roles: this.dataset.roles.length,
      records: this.dataset.records.length,
    };
  }
}

export function formatLocation(city: string, state: string): string {
  return [city, state].filter(Boolean).join(", ");
}

function fold(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function clamp(n: number, lo: number, hi: number): number {
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.floor(n))) : lo;
}
