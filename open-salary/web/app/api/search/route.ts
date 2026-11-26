import { NextResponse, type NextRequest } from "next/server";
import { CACHE_HEADERS, groupJSON } from "@/lib/api";
import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/search?q=software+engineer&city=new+york&limit=50&records=1
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const q = (p.get("q") ?? "").slice(0, 200);
  const city = (p.get("city") ?? "").slice(0, 100);
  const limit = Number(p.get("limit") ?? 50);
  const withRecords = p.get("records") !== "0";
  const index = getIndex();
  const { total, groups } = index.search({ q, city, limit });
  return NextResponse.json(
    { query: { q, city }, total, isSample: index.dataset.isSample, groups: groups.map((g) => groupJSON(g, withRecords)) },
    { headers: CACHE_HEADERS },
  );
}
