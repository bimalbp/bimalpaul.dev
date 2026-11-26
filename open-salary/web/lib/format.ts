export function money(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

/** 154000 -> "$154K" */
export function moneyShort(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: n >= 1_000_000 ? 1 : 0 }).format(n);
}

export const SOURCE_LABEL: Record<string, string> = {
  lca: "H-1B / LCA filing",
  posting: "Job posting",
  user: "User submission",
  sample: "Sample data",
};

export const PERIOD_LABEL: Record<string, string> = {
  year: "/yr",
  month: "/mo",
  biweek: "/2wk",
  week: "/wk",
  hour: "/hr",
};

/** "Senior Software Engineer", "Data Scientist II". */
export function roleName(role: { title: string; level?: string }): string {
  if (!role.level) return role.title;
  if (role.level.startsWith("Level ")) return `${role.title} ${role.level.slice(6)}`;
  return `${role.level} ${role.title}`;
}
