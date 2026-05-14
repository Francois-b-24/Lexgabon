"use client";

/** Chemins qui ressemblent à un fichier direct (téléchargement possible si le navigateur / l’origine le permet). */
const DIRECT_FILE = /\.(pdf|doc|docx|zip)(\?[^#]*)?(#.*)?$/i;

/**
 * Ouvre la source : pour les URLs « fichier », tente un lien avec attribut `download`
 * (souvent ignoré en cross-origin : l’onglet ou le visionneur s’ouvre quand même).
 * Sinon ouvre l’URL dans un nouvel onglet (pages web institutionnelles).
 */
export function openVeilleSource(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  if (DIRECT_FILE.test(parsed.pathname)) {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = "";
      a.setAttribute("aria-hidden", "true");
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch {
      /* fallback ci-dessous */
    }
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
