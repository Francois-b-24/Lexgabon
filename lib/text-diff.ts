/**
 * Diff article par article entre deux versions d'un texte juridique (T2.5).
 *
 * Algorithme :
 *  - On indexe chaque version par `numero` d'article.
 *  - Pour chaque numéro vu dans v1 ou v2 :
 *    * absent de v1 → article AJOUTÉ
 *    * absent de v2 → article SUPPRIMÉ
 *    * présent dans les deux → si contenu identique : INCHANGÉ ; sinon : MODIFIÉ
 *      avec diff intra-article calculé par segmentation en phrases puis LCS.
 *
 * Le diff intra-article est volontairement simple (segmentation par séparateur
 * phrase + LCS classique). Sur des articles très longs, le coût est en O(n*m)
 * sur le nombre de phrases — acceptable pour des textes juridiques (< 200 phrases
 * par article en pratique).
 */

export type VersionArticle = {
  numero: string;
  titre?: string | null;
  titreSection?: string | null;
  contenu: string;
};

export type VersionPayload = {
  articles: VersionArticle[];
};

export type DiffOp = "equal" | "insert" | "delete";

export type DiffSegment = {
  op: DiffOp;
  text: string;
};

export type ArticleDiffStatus = "unchanged" | "added" | "removed" | "modified";

export type ArticleDiff = {
  numero: string;
  status: ArticleDiffStatus;
  // Présent si modifié : liste des segments LCS-aware.
  segments?: DiffSegment[];
  // Snapshots utilisés pour le rendu côte-à-côte.
  before?: VersionArticle | null;
  after?: VersionArticle | null;
};

export type TextDiff = {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  articles: ArticleDiff[];
};

/** Découpe un texte juridique en phrases sur ponctuation forte ou point-virgule. */
function splitSentences(text: string): string[] {
  if (!text) return [];
  // Préserve la ponctuation finale (point, point-virgule, point d'exclamation, point d'interrogation).
  const parts = text.split(/(?<=[.!?;])\s+/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Diff LCS classique sur deux listes de phrases. Retourne la séquence
 * d'opérations (equal/insert/delete) qui transforme `a` en `b`.
 */
function lcsDiff(a: string[], b: string[]): DiffSegment[] {
  const n = a.length;
  const m = b.length;
  if (n === 0 && m === 0) return [];
  if (n === 0) return b.map((text) => ({ op: "insert" as const, text }));
  if (m === 0) return a.map((text) => ({ op: "delete" as const, text }));

  // Table LCS classique (longueur).
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack pour produire la séquence.
  const out: DiffSegment[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.push({ op: "equal", text: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.push({ op: "delete", text: a[i - 1] });
      i--;
    } else {
      out.push({ op: "insert", text: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    out.push({ op: "delete", text: a[i - 1] });
    i--;
  }
  while (j > 0) {
    out.push({ op: "insert", text: b[j - 1] });
    j--;
  }
  return out.reverse();
}

/** Diff intra-article : phrase-par-phrase via LCS. */
export function diffArticleContents(before: string, after: string): DiffSegment[] {
  if (before === after) {
    return before ? [{ op: "equal", text: before }] : [];
  }
  return lcsDiff(splitSentences(before), splitSentences(after));
}

/** Diff complet entre deux versions. */
export function diffVersions(before: VersionPayload, after: VersionPayload): TextDiff {
  const beforeMap = new Map<string, VersionArticle>();
  for (const a of before.articles ?? []) {
    if (a?.numero) beforeMap.set(a.numero, a);
  }
  const afterMap = new Map<string, VersionArticle>();
  for (const a of after.articles ?? []) {
    if (a?.numero) afterMap.set(a.numero, a);
  }

  // Ordre stable : on garde l'ordre d'apparition dans `after`, puis les supprimés de `before`.
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const a of after.articles ?? []) {
    if (a?.numero && !seen.has(a.numero)) {
      seen.add(a.numero);
      ordered.push(a.numero);
    }
  }
  for (const a of before.articles ?? []) {
    if (a?.numero && !seen.has(a.numero)) {
      seen.add(a.numero);
      ordered.push(a.numero);
    }
  }

  const articles: ArticleDiff[] = [];
  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;

  for (const num of ordered) {
    const a = beforeMap.get(num) ?? null;
    const b = afterMap.get(num) ?? null;
    if (a && !b) {
      removed++;
      articles.push({ numero: num, status: "removed", before: a, after: null });
      continue;
    }
    if (!a && b) {
      added++;
      articles.push({ numero: num, status: "added", before: null, after: b });
      continue;
    }
    if (a && b) {
      if (a.contenu === b.contenu) {
        unchanged++;
        articles.push({ numero: num, status: "unchanged", before: a, after: b });
        continue;
      }
      modified++;
      articles.push({
        numero: num,
        status: "modified",
        before: a,
        after: b,
        segments: diffArticleContents(a.contenu, b.contenu),
      });
    }
  }

  return { added, removed, modified, unchanged, articles };
}
