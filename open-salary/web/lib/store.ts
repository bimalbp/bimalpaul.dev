import "server-only";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { SalaryIndex } from "./search";
import type { Dataset } from "./types";

const DATA_FILE = process.env.SALARY_DATA_FILE ?? path.join(process.cwd(), "data", "dataset.json");

let cached: { mtimeMs: number; index: SalaryIndex } | null = null;

/** Loads data/dataset.json once, and again whenever the file changes. */
export function getIndex(): SalaryIndex {
  const { mtimeMs } = statSync(DATA_FILE);
  if (!cached || cached.mtimeMs !== mtimeMs) {
    const dataset = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Dataset;
    cached = { mtimeMs, index: new SalaryIndex(dataset) };
  }
  return cached.index;
}
