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
  const ct = res.headers.get("content-type") ?? "";

  // Si le backend renvoie déjà du JSON, on le retransmet tel quel.
  if (ct.toLowerCase().includes("application/json")) {
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sinon (HTML d'erreur 502 d'edge, page Render au cold-start, plain text),
  // on encapsule la réponse dans une enveloppe JSON pour que le front puisse
  // toujours faire .json() sans planter sur un "Unexpected token '<'".
  const snippet = text.trim().slice(0, 240);
  const status = res.status >= 400 ? res.status : 502;
  return NextResponse.json(
    {
      detail:
        status === 502 || status === 503 || status === 504
          ? "Le service Ama'IA est temporairement indisponible. Réessayez dans quelques instants."
          : `Réponse inattendue du service (status ${res.status}).`,
      upstream_status: res.status,
      upstream_snippet: snippet || null,
    },
    { status },
  );
}
