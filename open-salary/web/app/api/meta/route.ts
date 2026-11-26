import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/api";
import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/meta -> dataset freshness, sources and counts
export function GET() {
  const index = getIndex();
  const { generatedAt, isSample, sources } = index.dataset;
  return NextResponse.json({ generatedAt, isSample, sources, counts: index.stats() }, { headers: CACHE_HEADERS });
}
