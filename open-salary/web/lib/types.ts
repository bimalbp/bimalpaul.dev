// Data model from the v1 sketch: Company, Role, SalaryRecord.

export type SourceType = "lca" | "posting" | "user" | "sample";
export type PayPeriod = "year" | "month" | "biweek" | "week" | "hour";

export interface Company {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  domain?: string;
}

export interface Role {
  id: string;
  /** Normalized title, e.g. "Software Engineer". */
  title: string;
  /** Level when known, e.g. "Senior". */
  level?: string;
  /** Job function, e.g. "Engineering". */
  function?: string;
}

export interface SalaryRecord {
  id: string;
  companyId: string;
  roleId: string;
  rawTitle: string;
  city: string;
  state: string;
  min: number;
  max: number;
  currency: string;
  payPeriod: PayPeriod;
  /** min/max converted to a yearly figure, so ranges can be compared. */
  annualMin: number;
  annualMax: number;
  sourceType: SourceType;
  /** Public page the number came from. Every record has one. */
  sourceUrl: string;
  /** Identifier inside the source, e.g. an LCA case number. */
  sourceRef?: string;
  /** ISO date (YYYY-MM-DD) the number was observed or filed. */
  observedDate: string;
}

export interface Dataset {
  generatedAt: string;
  /** True when the data is synthetic demo data, not real records. */
  isSample: boolean;
  sources: { type: SourceType; label: string; url: string; period?: string }[];
  companies: Company[];
  roles: Role[];
  records: SalaryRecord[];
}

/** One row of results: a role at a company in a city, summarized. */
export interface SalaryGroup {
  key: string;
  company: Company;
  role: Role;
  location: string;
  count: number;
  /** Annual figures in the record currency. */
  median: number;
  p25: number;
  p75: number;
  low: number;
  high: number;
  currency: string;
  lastUpdated: string;
  sourceTypes: SourceType[];
  records: SalaryRecord[];
}
