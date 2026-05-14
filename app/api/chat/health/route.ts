import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Cold start Render : Vercel Pro autorise des fonctions longues — laisser ~2 min au backend. */
export const maxDuration = 120;

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
    /** Render en veille : TCP + boot + TLS peuvent dépasser 55 s ; laisser ~110 s avant abort. */
    const to = setTimeout(() => ac.abort(), 110_000);
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
          ? `Délai dépassé (~110 s) en joignant ${host}. Le service Render ne répond pas assez vite (veille, surcharge ou incident). Ouvrez https://${host}/health dans le navigateur ; consultez les logs Render. Si le problème persiste, passez à une instance toujours active ou vérifiez la RAM au démarrage.`
          : `Connexion impossible vers ${host} : ${msg}. Vérifiez LEGAL_AGENT_API_BASE_URL (https, pas d’espace).`,
      },
      { status: 502 },
    );
  }
}
