import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { textes } from "@/lib/db/schema";
import { resolveMockTexteDetail } from "@/lib/mock/veille";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(textes).where(eq(textes.slug, slug)).limit(1);
      if (rows[0]) {
        return NextResponse.json(rows[0]);
      }
    } catch {
      /* ignore — mock ou 404 */
    }
  }
  const mock = resolveMockTexteDetail(slug);
  if (mock) {
    return NextResponse.json(mock);
  }
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
