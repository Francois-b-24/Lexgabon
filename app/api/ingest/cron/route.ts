import { NextResponse } from "next/server";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** POST : appels manuels ou intégrations. GET : compatible jobs [Vercel Cron](https://vercel.com/docs/cron-jobs) (requête GET). */
export async function POST(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, message: "Ingestion à brancher (scripts/ingest/*)." });
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, message: "Ingestion à brancher (scripts/ingest/*)." });
}
