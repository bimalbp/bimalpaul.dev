import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanCompanyName, normalizeTitle, parseMoney, parsePayPeriod, slugify, toAnnual } from "../lib/normalize";

test("pay periods convert to annual", () => {
  assert.equal(toAnnual(50, "hour"), 104_000);
  assert.equal(toAnnual(10_000, "month"), 120_000);
  assert.equal(parsePayPeriod("Bi-Weekly"), "biweek");
  assert.equal(parsePayPeriod("Year"), "year");
  assert.equal(parsePayPeriod("fortnight"), null);
});

test("money parsing", () => {
  assert.equal(parseMoney("$120,000.00"), 120000);
  assert.equal(parseMoney(95000), 95000);
  assert.equal(parseMoney(""), null);
  assert.equal(parseMoney("n/a"), null);
  assert.equal(parseMoney(0), null);
});

test("company names are cleaned", () => {
  assert.equal(cleanCompanyName("GOOGLE LLC"), "Google");
  assert.equal(cleanCompanyName("Amazon.com Services, Inc."), "Amazon.com Services");
  assert.equal(cleanCompanyName("ERNST & YOUNG U.S. LLP"), "Ernst & Young U.S.");
  assert.equal(slugify("Ernst & Young U.S."), "ernst-and-young-u-s");
});

test("titles normalize to role + level", () => {
  assert.deepEqual(normalizeTitle("Sr. Software Developer"), { title: "Software Engineer", level: "Senior", function: "Engineering" });
  assert.deepEqual(normalizeTitle("SDE II"), { title: "Software Engineer", level: "Level II", function: "Engineering" });
  assert.equal(normalizeTitle("Data Scientist").title, "Data Scientist");
  assert.equal(normalizeTitle("Senior Data Engineer").level, "Senior");
  assert.deepEqual(normalizeTitle("CHEMICAL ENGINEER III"), { title: "Chemical Engineer", level: "Level III" });
});
