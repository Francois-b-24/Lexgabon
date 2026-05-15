import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { parseSearchFilters, runSearch } from "@/lib/search-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!rateLimit(`search:${ip}`)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    let searchParams: URLSearchParams;
    try {
      searchParams = new URL(req.url).searchParams;
    } catch {
      return NextResponse.json({ hits: [], total: 0, page: 1, pageSize: 0, mode: "fulltext", degraded: true });
    }

    const filters = parseSearchFilters(searchParams);
    const response = await runSearch(filters);
    return NextResponse.json(response);
  } catch (e) {
    console.error("[api/search]", e);
    return NextResponse.json(
      { hits: [], total: 0, page: 1, pageSize: 0, mode: "fulltext", degraded: true, error: "search_failed" },
      { status: 200 },
    );
  }
}
