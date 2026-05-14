import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Cold start lourd (embeddings/Chroma) : Vercel Pro — jusqu’à 5 min pour le premier octet depuis Render. */
export const maxDuration = 300;

function backendBase(): string | null {
  const b = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  return b || null;
}

function safeHost(base: string): string {
  try {
    return new URL(base).hostname;
  } catch {
    return "(URL invalide)";
  }
}

/** Santé du backend FastAPI (proxy) — renvoie toujours un JSON lisible pour diagnostiquer les pannes. */
export async function GET() {
  const base = backendBase();
  if (!base) {
    return NextResponse.json(
      {
        ok: false,
        detail:
          "Variable Vercel LEGAL_AGENT_API_BASE_URL absente ou vide. Vercel → Project → Settings → Environment Variables → cocher Production (et Preview si besoin) → valeur = URL HTTPS Render sans slash final → Enregistrer puis redéployer le projet (Deployments → … → Redeploy).",
      },
      { status: 503 },
    );
  }

  const url = `${base.replace(/\/$/, "")}/health`;
  const host = safeHost(base);

  try {
    const ac = new AbortController();
    /** Cold start Render (gratuit / peu de RAM) peut dépasser 2 min avant la première réponse HTTP. */
    const to = setTimeout(() => ac.abort(), 280_000);
    const r = await fetch(url, {
      cache: "no-store",
      signal: ac.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(to);
    const text = await r.text();
    let backend: unknown = {};
    try {
      backend = text ? JSON.parse(text) : {};
    } catch {
      backend = { raw: text.slice(0, 300) };
    }

    if (!r.ok) {
      return NextResponse.json(
        {
          ok: false,
          detail: `Le backend (${host}) a répondu HTTP ${r.status}. Ouvrez dans un onglet : https://${host}/health — vérifiez Render (logs, service suspendu, mauvaise branche ou root directory « backend »).`,
          backend,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, backend, host }, { status: 200 });
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        detail: aborted
          ? `Délai dépassé (~4 min 40) en joignant ${host}. Render n’a pas renvoyé /health à temps (veille très longue, démarrage bloqué ou OOM). Ouvrez https://${host}/health : si le navigateur ne reçoit jamais {"status":"ok"}, corrigez Render (logs, RAM/instance, plan toujours actif). Sinon augmentez la RAM ou désactivez la mise en veille.`
          : `Connexion impossible vers ${host} : ${msg}. Vérifiez LEGAL_AGENT_API_BASE_URL (https, pas d’espace).`,
      },
      { status: 502 },
    );
  }
}
