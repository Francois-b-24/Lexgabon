import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
/** RAG + plusieurs tours d’outils + LLM : 5 min côté Vercel (Pro). */
export const maxDuration = 300;

/** Limite côté Next par IP (complète le rate limit du backend FastAPI). */
const CHAT_MAX_PER_MINUTE = 20;

function backendBase(): string | null {
  const b = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  return b || null;
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`chat:${ip}`, CHAT_MAX_PER_MINUTE)) {
    return NextResponse.json({ detail: "rate_limited" }, { status: 429 });
  }

  const base = backendBase();
  if (!base) {
    return NextResponse.json(
      { detail: "LEGAL_AGENT_API_BASE_URL n'est pas configuré (URL du service FastAPI, côté serveur uniquement)." },
      { status: 503 },
    );
  }

  const body = await req.text();
  const url = `${base.replace(/\/$/, "")}/api/chat`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": h.get("x-forwarded-for") ?? "",
      },
      body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network_error";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }

  const text = await res.text();
  const ct = res.headers.get("content-type") ?? "application/json";
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": ct } });
}
