import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
  const url = `${base.replace(/\/$/, "")}/api/upload-pdf`;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ detail: "corps multipart invalide" }, { status: 400 });
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
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
