import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { searchTextes } from "@/lib/meilisearch";

const MAX_QUERY_LENGTH = 256;

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
      return NextResponse.json({ hits: [] });
    }

    const raw = searchParams.get("q") ?? "";
    const q = raw.slice(0, MAX_QUERY_LENGTH);

    const hits = await searchTextes(q);
    return NextResponse.json({ hits });
  } catch (e) {
    console.error("[api/search]", e);
    return NextResponse.json({ hits: [], error: "search_failed" }, { status: 200 });
  }
}
