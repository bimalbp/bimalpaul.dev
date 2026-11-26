import type { PayPeriod } from "./types";

const HOURS_PER_YEAR = 2080;

const PERIOD_FACTOR: Record<PayPeriod, number> = {
  year: 1,
  month: 12,
  biweek: 26,
  week: 52,
  hour: HOURS_PER_YEAR,
};

export function toAnnual(amount: number, period: PayPeriod): number {
  return Math.round(amount * PERIOD_FACTOR[period]);
}

/** Maps DOL "WAGE_UNIT_OF_PAY" values (and common variants) to a PayPeriod. */
export function parsePayPeriod(raw: string | undefined | null): PayPeriod | null {
  const v = (raw ?? "").trim().toLowerCase().replace(/[\s_-]/g, "");
  if (["year", "yr", "annual", "yearly", "annually"].includes(v)) return "year";
  if (["month", "monthly", "mth"].includes(v)) return "month";
  if (["biweekly", "biweek"].includes(v)) return "biweek";
  if (["week", "weekly", "wk"].includes(v)) return "week";
  if (["hour", "hourly", "hr"].includes(v)) return "hour";
  return null;
}

/** "$120,000.00" -> 120000. Returns null for blanks and non-numbers. */
export function parseMoney(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) && raw > 0 ? raw : null;
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const COMPANY_SUFFIXES =
  /\b(incorporated|inc|llc|l\.l\.c|ltd|limited|corp|corporation|co|company|plc|lp|llp|pllc|pc|na|n\.a)\b\.?/gi;

/** "GOOGLE LLC" -> "Google"; "Amazon.com Services, Inc." -> "Amazon.com Services". */
export function cleanCompanyName(raw: string): string {
  const base = raw
    .replace(/,/g, " ")
    .replace(COMPANY_SUFFIXES, " ")
    .replace(/\s+/g, " ")
    .trim();
  return titleCase(base || raw.trim());
}

const SMALL_WORDS = new Set(["of", "and", "the", "for", "in", "at", "on", "to", "a"]);
const KEEP_UPPER = new Set(["ii", "iii", "iv", "it", "qa", "ui", "ux", "ai", "ml", "sre", "hr", "vp", "cto", "ceo", "cfo", "ibm", "usa", "us", "aws", "sap", "llc"]);

export function titleCase(s: string): string {
  // Leave mixed-case input alone (it was probably typed with care).
  if (s !== s.toUpperCase() && s !== s.toLowerCase()) return s.trim();
  return s
    .toLowerCase()
    .split(/(\s+|\/|-)/)
    .map((w, i) => {
      if (!w.trim() || w === "/" || w === "-") return w;
      if (KEEP_UPPER.has(w)) return w.toUpperCase();
      if (i > 0 && SMALL_WORDS.has(w)) return w;
      // Capitalize after dots too: "u.s." -> "U.S."
      return w.replace(/(^|\.)([a-z])/g, (_m, dot: string, c: string) => dot + c.toUpperCase());
    })
    .join("")
    .trim();
}

const LEVEL_PATTERNS: [RegExp, string][] = [
  [/\b(principal)\b/i, "Principal"],
  [/\b(staff)\b/i, "Staff"],
  [/\b(lead)\b/i, "Lead"],
  [/\b(senior|sr\.?)\b/i, "Senior"],
  [/\b(junior|jr\.?|associate|entry[- ]level)\b/i, "Junior"],
  [/\b(iv|4)\s*$/i, "Level IV"],
  [/\b(iii|3)\s*$/i, "Level III"],
  [/\b(ii|2)\s*$/i, "Level II"],
  [/\b(i|1)\s*$/i, "Level I"],
];

const TITLE_ALIASES: [RegExp, string, string][] = [
  [/\b(software|application|applications)\b.*\b(engineer|developer|dev)\b|\b(swe|sde)\b/i, "Software Engineer", "Engineering"],
  [/\bdata scien/i, "Data Scientist", "Data"],
  [/\bdata engineer/i, "Data Engineer", "Data"],
  [/\b(machine learning|ml)\b.*\bengineer/i, "Machine Learning Engineer", "Engineering"],
  [/\bproduct manager\b/i, "Product Manager", "Product"],
  [/\b(product|ux|ui) designer\b/i, "Product Designer", "Design"],
  [/\bdata analyst\b/i, "Data Analyst", "Data"],
  [/\bbusiness analyst\b/i, "Business Analyst", "Business"],
  [/\b(devops|site reliability|sre)\b/i, "DevOps / SRE Engineer", "Engineering"],
  [/\b(financial analyst)\b/i, "Financial Analyst", "Finance"],
  [/\b(accountant)\b/i, "Accountant", "Finance"],
  [/\b(physician|hospitalist)\b/i, "Physician", "Healthcare"],
  [/\b(registered nurse|rn)\b/i, "Registered Nurse", "Healthcare"],
];

/** Maps a raw job title to a normalized role title, level and function. */
export function normalizeTitle(raw: string): { title: string; level?: string; function?: string } {
  const t = raw.replace(/\s+/g, " ").trim();
  let level: string | undefined;
  for (const [re, name] of LEVEL_PATTERNS) {
    if (re.test(t)) {
      level = name;
      break;
    }
  }
  for (const [re, title, fn] of TITLE_ALIASES) {
    if (re.test(t)) return { title, level, function: fn };
  }
  // Unknown title: strip level words and keep it as written.
  const stripped = t
    .replace(/\b(senior|sr\.?|junior|jr\.?|staff|principal|lead)\b/gi, "")
    .replace(/\b(i{1,3}|iv|[1-4])\s*$/i, "")
    .replace(/[\s,-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return { title: titleCase(stripped || t), level };
}
