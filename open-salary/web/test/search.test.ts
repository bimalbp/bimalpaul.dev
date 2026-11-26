import assert from "node:assert/strict";
import { test } from "node:test";
import { DatasetBuilder, type RawRecord } from "../lib/builder";
import { SalaryIndex } from "../lib/search";
import { percentile } from "../lib/stats";

const base: RawRecord = {
  companyName: "EXAMPLE CORP",
  rawTitle: "Software Engineer",
  city: "NEW YORK",
  state: "ny",
  min: 100_000,
  max: 140_000,
  payPeriod: "year",
  sourceType: "lca",
  sourceUrl: "https://example.org/source",
  observedDate: "2026-03-01",
};

function index(rows: Partial<RawRecord>[]) {
  const b = new DatasetBuilder();
  rows.forEach((r, i) => b.add({ ...base, sourceRef: `I-${i}`, ...r }));
  return new SalaryIndex(b.build({ isSample: false, sources: [] }));
}

test("percentile interpolates", () => {
  assert.equal(percentile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(percentile([10], 0.25), 10);
});

test("records group by company, role and city with stats", () => {
  const idx = index([{ min: 100_000, max: 120_000 }, { min: 120_000, max: 140_000 }, { min: 140_000, max: 160_000 }, { city: "Austin", state: "TX" }]);
  const { groups } = idx.search({ q: "example software" });
  assert.equal(groups.length, 2);
  const ny = groups.find((g) => g.location === "New York, NY")!;
  assert.equal(ny.count, 3);
  assert.equal(ny.median, 130_000);
  assert.equal(ny.low, 100_000);
  assert.equal(ny.high, 160_000);
  assert.ok(ny.records.every((r) => r.sourceUrl));
});

test("city filter and company lookup", () => {
  const idx = index([{}, { city: "Austin", state: "TX" }, { companyName: "Other Co", rawTitle: "Data Scientist" }]);
  assert.equal(idx.search({ q: "software", city: "austin" }).total, 1);
  assert.equal(idx.search({ q: "data scientist" }).groups[0].company.name, "Other");
  assert.equal(idx.company("example")!.groups.length, 2);
  assert.equal(idx.company("nope"), null);
  assert.equal(idx.search({ q: "" }).total, 0);
});

test("duplicates and implausible wages are dropped", () => {
  const b = new DatasetBuilder();
  assert.equal(b.add({ ...base, sourceRef: "A" }), true);
  assert.equal(b.add({ ...base, sourceRef: "A" }), false);
  assert.equal(b.add({ ...base, sourceRef: "B", min: 3, max: 3 }), false); // $3/yr
  assert.equal(b.add({ ...base, sourceRef: "C", min: 40, max: 55, payPeriod: "hour" }), true);
  assert.deepEqual(b.skipped, { badWage: 1, duplicate: 1 });
});

test("suggest lists companies by prefix, or A–Z when empty", () => {
  const idx = index([{}, { companyName: "Beta Labs" }, { companyName: "Alpha Works" }]);
  assert.deepEqual(idx.suggest("be").map((c) => c.name), ["Beta Labs"]);
  assert.deepEqual(idx.suggest("").map((c) => c.name), ["Alpha Works", "Beta Labs", "Example"]);
});
