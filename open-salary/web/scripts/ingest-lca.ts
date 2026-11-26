/**
 * Loads a US Department of Labor LCA disclosure file (H-1B wage filings) into data/dataset.json.
 *
 *   npm run data:lca -- raw/LCA_Disclosure_Data_FY2025_Q4.xlsx --period "FY2025 Q4"
 *
 * Download the quarterly file from https://www.dol.gov/agencies/eta/foreign-labor/performance
 * ("LCA Programs (H-1B, H-1B1, E-3)"). Both .xlsx (as published) and .csv exports work.
 *
 * Options:
 *   --out <file>      output dataset (default data/dataset.json)
 *   --append          merge into the existing dataset instead of replacing it
 *   --period <label>  label shown next to the source, e.g. "FY2025 Q4"
 *   --limit <n>       stop after n accepted rows (handy for a quick test)
 */
import { createReadStream, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import ExcelJS from "exceljs";
import { DatasetBuilder } from "../lib/builder";
import { parseMoney, parsePayPeriod } from "../lib/normalize";
import type { Dataset } from "../lib/types";

export const LCA_SOURCE_URL = "https://www.dol.gov/agencies/eta/foreign-labor/performance";
const KEEP_STATUS = new Set(["certified"]);
const KEEP_VISAS = new Set(["h-1b", "h-1b1 chile", "h-1b1 singapore", "e-3 australian"]);

type Row = Record<string, unknown>;

function args() {
  const a = process.argv.slice(2);
  const opt = (name: string) => {
    const i = a.indexOf(name);
    return i >= 0 ? a[i + 1] : undefined;
  };
  const file = a.find((x, i) => !x.startsWith("--") && !a[i - 1]?.match(/^--(out|period|limit)$/));
  if (!file) {
    console.error("Usage: npm run data:lca -- <LCA file .xlsx|.csv> [--out data/dataset.json] [--append] [--period 'FY2025 Q4'] [--limit n]");
    process.exit(1);
  }
  return {
    file,
    out: opt("--out") ?? path.join("data", "dataset.json"),
    append: a.includes("--append"),
    period: opt("--period"),
    limit: opt("--limit") ? Number(opt("--limit")) : Infinity,
  };
}

async function* readRows(file: string): AsyncGenerator<Row> {
  if (file.toLowerCase().endsWith(".csv")) {
    const parser = createReadStream(file).pipe(parse({ columns: (h: string[]) => h.map(normHeader), bom: true, relax_column_count: true }));
    for await (const row of parser) yield row as Row;
    return;
  }
  // Stream the workbook: DOL files have ~100k+ rows and won't fit comfortably in memory otherwise.
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(file, { sharedStrings: "cache", hyperlinks: "ignore", styles: "ignore", worksheets: "emit" });
  for await (const sheet of reader) {
    let headers: string[] | null = null;
    for await (const row of sheet) {
      const values = (row.values as unknown[]).slice(1);
      if (!headers) {
        headers = values.map((v) => normHeader(String(v ?? "")));
        continue;
      }
      const obj: Row = {};
      headers.forEach((h, i) => (obj[h] = cellValue(values[i])));
      yield obj;
    }
    break; // data is on the first sheet
  }
}

function normHeader(h: string): string {
  return h.trim().toUpperCase().replace(/\s+/g, "_");
}

function cellValue(v: unknown): unknown {
  if (v && typeof v === "object") {
    if (v instanceof Date) return v;
    const o = v as { text?: string; result?: unknown; richText?: { text: string }[] };
    if (o.richText) return o.richText.map((t) => t.text).join("");
    if (o.result !== undefined) return o.result;
    if (o.text !== undefined) return o.text;
  }
  return v;
}

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function isoDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function main() {
  const opts = args();
  const seed = opts.append && existsSync(opts.out) ? (JSON.parse(readFileSync(opts.out, "utf8")) as Dataset) : undefined;
  if (seed?.isSample) {
    console.error("Refusing to --append real data onto the sample dataset. Run without --append to replace it.");
    process.exit(1);
  }
  const b = new DatasetBuilder(seed);
  const seen = { rows: 0, accepted: 0, status: 0, visa: 0, missing: 0 };

  for await (const row of readRows(opts.file)) {
    seen.rows++;
    if (!KEEP_STATUS.has(str(row.CASE_STATUS).toLowerCase())) {
      seen.status++;
      continue;
    }
    const visa = str(row.VISA_CLASS).toLowerCase();
    if (visa && !KEEP_VISAS.has(visa)) {
      seen.visa++;
      continue;
    }
    const from = parseMoney(row.WAGE_RATE_OF_PAY_FROM);
    const to = parseMoney(row.WAGE_RATE_OF_PAY_TO) ?? from;
    const period = parsePayPeriod(str(row.WAGE_UNIT_OF_PAY));
    const employer = str(row.EMPLOYER_NAME);
    const title = str(row.JOB_TITLE);
    const date = isoDate(row.DECISION_DATE) ?? isoDate(row.RECEIVED_DATE);
    if (!from || !to || !period || !employer || !title || !date) {
      seen.missing++;
      continue;
    }
    const added = b.add({
      companyName: employer,
      rawTitle: title,
      city: str(row.WORKSITE_CITY),
      state: str(row.WORKSITE_STATE),
      min: from,
      max: to,
      payPeriod: period,
      sourceType: "lca",
      sourceUrl: LCA_SOURCE_URL,
      sourceRef: str(row.CASE_NUMBER) || undefined,
      observedDate: date,
    });
    if (added && ++seen.accepted >= opts.limit) break;
    if (seen.rows % 50_000 === 0) console.log(`  …${seen.rows.toLocaleString()} rows read`);
  }

  const sources = (seed?.sources ?? []).filter((s) => !(s.type === "lca" && s.period === opts.period));
  sources.push({ type: "lca", label: "US Department of Labor, LCA disclosure data", url: LCA_SOURCE_URL, period: opts.period });
  const dataset = b.build({ isSample: false, sources });
  writeFileSync(opts.out, JSON.stringify(dataset));

  console.log(`Read ${seen.rows.toLocaleString()} rows from ${path.basename(opts.file)}`);
  console.log(`  accepted ${seen.accepted.toLocaleString()}; skipped: not certified ${seen.status}, other visa ${seen.visa}, missing fields ${seen.missing}, implausible wage ${b.skipped.badWage}, duplicate ${b.skipped.duplicate}`);
  console.log(`Wrote ${opts.out}: ${dataset.companies.length} companies, ${dataset.roles.length} roles, ${dataset.records.length} records`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
