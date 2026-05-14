import { NextResponse } from "next/server";

export const runtime = "nodejs";

function backendBase(): string | null {
  const b = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  return b || null;
}

/** Santé du backend FastAPI (proxy). */
export async function GET() {
  const base = backendBase();
  if (!base) {
    return NextResponse.json({ ok: false, detail: "LEGAL_AGENT_API_BASE_URL manquant" }, { status: 503 });
  }
  try {
    const r = await fetch(`${base.replace(/\/$/, "")}/health`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    return NextResponse.json({ ok: r.ok, backend: j }, { status: r.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
