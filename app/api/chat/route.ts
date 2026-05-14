import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

function backendBase(): string | null {
  const b = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  return b || null;
}

export async function POST(req: Request) {
  const base = backendBase();
  if (!base) {
    return NextResponse.json(
      { detail: "LEGAL_AGENT_API_BASE_URL n'est pas configuré (URL du service FastAPI, côté serveur uniquement)." },
      { status: 503 },
    );
  }

  const h = await headers();
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
