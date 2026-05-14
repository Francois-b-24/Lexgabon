import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Cold start Render + réseau : augmenter la limite Vercel (sinon timeout ~10 s sur certains plans). */
export const maxDuration = 60;

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
    const to = setTimeout(() => ac.abort(), 55_000);
    const r = await fetch(url, { cache: "no-store", signal: ac.signal });
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
          ? `Délai dépassé (~55 s) en joignant ${host}. Souvent un « cold start » Render : attendez 30–60 s, ouvrez https://${host}/health dans le navigateur pour réveiller le service, puis rafraîchissez cette page. Sur Vercel Hobby, la limite d’exécution peut aussi couper l’appel : augmentez maxDuration ou passez un plan supérieur.`
          : `Connexion impossible vers ${host} : ${msg}. Vérifiez l’URL dans LEGAL_AGENT_API_BASE_URL (https, pas d’espace, bon sous-domaine onrender.com).`,
      },
      { status: 502 },
    );
  }
}
