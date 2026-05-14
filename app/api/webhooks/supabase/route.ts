import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function signaturesMatch(header: string, secret: string): boolean {
  const a = Buffer.from(header, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  const sig = req.headers.get("x-supabase-signature");

  if (secret) {
    if (!sig || !signaturesMatch(sig, secret)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json({ received: true });
}
