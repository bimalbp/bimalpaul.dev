/**
 * Writes a small synthetic dataset to data/dataset.json so the apps run before real data is loaded.
 * Every company here is fictional and every record is marked sourceType "sample"; the apps show a
 * "sample data" banner while dataset.isSample is true. Replace it with: npm run data:lca -- <file>
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { DatasetBuilder } from "../lib/builder";

const SAMPLE_URL = "https://github.com/bimalbp/bimalpaul.dev/tree/main/open-salary#sample-data";

// Deterministic PRNG so the sample file is stable across runs.
let seed = 42;
function rand(): number {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
}
const pick = <T>(xs: T[]): T => xs[Math.floor(rand() * xs.length)];

const COMPANIES = [
  { name: "Cobalt Harbor Software Inc.", scale: 1.15 },
  { name: "Fernleaf Health LLC", scale: 0.95 },
  { name: "Quillstone Analytics", scale: 1.0 },
  { name: "Tidewater Robotics Corp.", scale: 1.1 },
  { name: "Marigold Payments, Inc.", scale: 1.2 },
  { name: "Larkspur Cloud Systems", scale: 1.25 },
  { name: "Ironbark Logistics", scale: 0.85 },
  { name: "Saltmarsh Media Group", scale: 0.9 },
];

const CITIES: { city: string; state: string; col: number }[] = [
  { city: "New York", state: "NY", col: 1.15 },
  { city: "San Francisco", state: "CA", col: 1.2 },
  { city: "Seattle", state: "WA", col: 1.1 },
  { city: "Denver", state: "CO", col: 0.95 },
  { city: "Austin", state: "TX", col: 0.92 },
  { city: "Chicago", state: "IL", col: 0.97 },
];

const ROLES: { titles: string[]; base: number; hourly?: boolean }[] = [
  { titles: ["Software Engineer", "Software Developer", "Software Engineer II", "SDE II"], base: 135_000 },
  { titles: ["Senior Software Engineer", "Sr. Software Developer"], base: 175_000 },
  { titles: ["Staff Software Engineer"], base: 215_000 },
  { titles: ["Data Scientist", "Data Scientist II"], base: 140_000 },
  { titles: ["Senior Data Engineer", "Data Engineer"], base: 150_000 },
  { titles: ["Product Manager", "Senior Product Manager"], base: 155_000 },
  { titles: ["Product Designer", "UX Designer"], base: 125_000 },
  { titles: ["Data Analyst", "Business Analyst"], base: 92_000 },
  { titles: ["DevOps Engineer", "Site Reliability Engineer"], base: 150_000 },
  { titles: ["Customer Support Specialist"], base: 26, hourly: true },
];

const b = new DatasetBuilder();
const start = Date.UTC(2026, 0, 1);
const span = Date.UTC(2026, 10, 15) - start;

for (const c of COMPANIES) {
  const cities = CITIES.filter(() => rand() < 0.6);
  if (cities.length === 0) cities.push(pick(CITIES));
  for (const role of ROLES) {
    if (rand() < 0.25) continue;
    for (const loc of cities) {
      const n = 1 + Math.floor(rand() * 5);
      for (let i = 0; i < n; i++) {
        const mid = role.base * c.scale * loc.col * (0.9 + rand() * 0.2);
        const width = role.hourly ? 0.15 : 0.12 + rand() * 0.18;
        const round = role.hourly ? 0.5 : 1000;
        const min = Math.round((mid * (1 - width / 2)) / round) * round;
        const max = Math.round((mid * (1 + width / 2)) / round) * round;
        b.add({
          companyName: c.name,
          rawTitle: pick(role.titles),
          city: loc.city,
          state: loc.state,
          min,
          max,
          payPeriod: role.hourly ? "hour" : "year",
          sourceType: "sample",
          sourceUrl: SAMPLE_URL,
          observedDate: new Date(start + rand() * span).toISOString().slice(0, 10),
        });
      }
    }
  }
}

const out = path.join("data", "dataset.json");
const dataset = b.build({
  isSample: true,
  sources: [{ type: "sample", label: "Synthetic sample data (fictional companies)", url: SAMPLE_URL }],
});
writeFileSync(out, JSON.stringify(dataset, null, 1));
console.log(`Wrote ${out}: ${dataset.companies.length} companies, ${dataset.roles.length} roles, ${dataset.records.length} sample records`);
