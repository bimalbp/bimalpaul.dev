import { NextResponse, type NextRequest } from "next/server";
import { CACHE_HEADERS } from "@/lib/api";
import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/companies?prefix=cob  -> company suggestions for autocomplete
// GET /api/companies               -> first 40 companies A–Z (for browsing)
export function GET(req: NextRequest) {
  const prefix = (req.nextUrl.searchParams.get("prefix") ?? "").slice(0, 100);
  const companies = getIndex().suggest(prefix, prefix.trim() ? 8 : 40).map(({ id, slug, name }) => ({ id, slug, name }));
  return NextResponse.json({ companies }, { headers: CACHE_HEADERS });
}
