import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const INGEST_MAX_PER_MINUTE = 15;

function backendBase(): string | null {
  const b = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  return b || null;
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`ingest-url:${ip}`, INGEST_MAX_PER_MINUTE)) {
    return NextResponse.json({ detail: "rate_limited" }, { status: 429 });
  }

  const base = backendBase();
  if (!base) {
    return NextResponse.json(
      { detail: "LEGAL_AGENT_API_BASE_URL n'est pas configuré (URL du service FastAPI, côté serveur uniquement)." },
      { status: 503 },
    );
  }

  let body: string;
  try {
    body = await req.text();
  } catch {
    return NextResponse.json({ detail: "corps invalide" }, { status: 400 });
  }

  const url = `${base.replace(/\/$/, "")}/api/ingest-url`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": h.get("x-forwarded-for") ?? "",
      },
      body,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network_error";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}
