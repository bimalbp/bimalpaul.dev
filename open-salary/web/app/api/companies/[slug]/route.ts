import { NextResponse, type NextRequest } from "next/server";
import { CACHE_HEADERS, groupJSON } from "@/lib/api";
import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/companies/:slug
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const index = getIndex();
  const result = index.company(slug);
  if (!result) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  return NextResponse.json(
    { company: result.company, isSample: index.dataset.isSample, groups: result.groups.map((g) => groupJSON(g, true)) },
    { headers: CACHE_HEADERS },
  );
}
