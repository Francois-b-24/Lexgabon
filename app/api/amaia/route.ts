import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { buildGabonLawContext } from "@/lib/amaia/build-context";
import { AMAIA_SYSTEM_PROMPT } from "@/lib/amaia/system-prompt";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * État de configuration (aucune clé exposée). Utilisable pour les contrôles Vercel
 * et le bandeau d’état sur la page Ama'IA.
 */
export async function GET() {
  const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
  return NextResponse.json(
    {
      anthropicConfigured,
      model: anthropicConfigured ? (process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514") : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`amaia:${ip}`)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "missing_anthropic_key",
        message: "Configurez ANTHROPIC_API_KEY pour activer Ama'IA.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = (await req.json()) as { messages?: ChatMessage[] };
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json", message: "Corps JSON invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  try {
    const context = await buildGabonLawContext(lastUser);

    const modelId = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
    const system = `${AMAIA_SYSTEM_PROMPT}\n\nContexte fourni (index + pages liste blanche) :\n${context}`;

    const result = streamText({
      model: anthropic(modelId),
      system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[amaia]", err);
    return new Response(
      JSON.stringify({
        error: "amaia_failed",
        message: "Le service Ama'IA est temporairement indisponible. Réessayez plus tard.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
