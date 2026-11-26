import { cleanCompanyName, normalizeTitle, slugify, toAnnual } from "./normalize";
import type { Company, Dataset, PayPeriod, Role, SalaryRecord, SourceType } from "./types";

export interface RawRecord {
  companyName: string;
  rawTitle: string;
  city: string;
  state: string;
  min: number;
  max: number;
  currency?: string;
  payPeriod: PayPeriod;
  sourceType: SourceType;
  sourceUrl: string;
  sourceRef?: string;
  observedDate: string;
}

const MIN_ANNUAL = 15_000;
const MAX_ANNUAL = 2_000_000;

/** Turns raw rows into a normalized, de-duplicated Dataset (pipeline steps 3–5). */
export class DatasetBuilder {
  private companies = new Map<string, Company>();
  private roles = new Map<string, Role>();
  private records = new Map<string, SalaryRecord>();
  readonly skipped = { badWage: 0, duplicate: 0 };

  constructor(seed?: Dataset) {
    if (!seed) return;
    for (const c of seed.companies) this.companies.set(c.id, c);
    for (const r of seed.roles) this.roles.set(r.id, r);
    for (const r of seed.records) this.records.set(dedupeKey(r), r);
  }

  private company(rawName: string): Company {
    const name = cleanCompanyName(rawName);
    const id = slugify(name);
    let c = this.companies.get(id);
    if (!c) {
      c = { id, slug: id, name, aliases: [] };
      this.companies.set(id, c);
    }
    const alias = rawName.trim();
    if (alias && alias !== c.name && !c.aliases.includes(alias) && c.aliases.length < 10) c.aliases.push(alias);
    return c;
  }

  private role(rawTitle: string): Role {
    const n = normalizeTitle(rawTitle);
    const id = slugify([n.title, n.level].filter(Boolean).join(" "));
    let r = this.roles.get(id);
    if (!r) {
      r = { id, title: n.title, level: n.level, function: n.function };
      this.roles.set(id, r);
    }
    return r;
  }

  add(raw: RawRecord): boolean {
    const min = Math.min(raw.min, raw.max);
    const max = Math.max(raw.min, raw.max);
    const annualMin = toAnnual(min, raw.payPeriod);
    const annualMax = toAnnual(max, raw.payPeriod);
    if (annualMin < MIN_ANNUAL || annualMax > MAX_ANNUAL) {
      this.skipped.badWage++;
      return false;
    }
    const company = this.company(raw.companyName);
    const role = this.role(raw.rawTitle);
    const rec: SalaryRecord = {
      id: "",
      companyId: company.id,
      roleId: role.id,
      rawTitle: raw.rawTitle.trim(),
      city: titleCity(raw.city),
      state: raw.state.trim().toUpperCase(),
      min,
      max,
      currency: raw.currency ?? "USD",
      payPeriod: raw.payPeriod,
      annualMin,
      annualMax,
      sourceType: raw.sourceType,
      sourceUrl: raw.sourceUrl,
      sourceRef: raw.sourceRef,
      observedDate: raw.observedDate,
    };
    const key = dedupeKey(rec);
    const existing = this.records.get(key);
    if (existing) {
      this.skipped.duplicate++;
      // Keep the newest observation of a repeated posting/filing.
      if (rec.observedDate > existing.observedDate) this.records.set(key, { ...rec, id: existing.id });
      return false;
    }
    rec.id = `${rec.sourceType}-${this.records.size + 1}`;
    this.records.set(key, rec);
    return true;
  }

  build(meta: Pick<Dataset, "isSample" | "sources">): Dataset {
    const records = [...this.records.values()];
    const usedCompanies = new Set(records.map((r) => r.companyId));
    const usedRoles = new Set(records.map((r) => r.roleId));
    return {
      generatedAt: new Date().toISOString(),
      ...meta,
      companies: [...this.companies.values()].filter((c) => usedCompanies.has(c.id)).sort((a, b) => a.name.localeCompare(b.name)),
      roles: [...this.roles.values()].filter((r) => usedRoles.has(r.id)).sort((a, b) => a.title.localeCompare(b.title)),
      records,
    };
  }
}

/** Same company, title, place and range = the same posting seen twice. */
function dedupeKey(r: SalaryRecord): string {
  if (r.sourceRef) return `${r.sourceType}|${r.sourceRef}`;
  return [r.sourceType, r.companyId, r.rawTitle.toLowerCase(), r.city.toLowerCase(), r.state, r.min, r.max, r.payPeriod].join("|");
}

function titleCity(s: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t !== t.toUpperCase()) return t;
  return t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
