/**
 * `metadataBase` invalide (URL mal formée dans l’env) fait planter tout le rendu Next.
 */
export function getSafeMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* ignore */
    }
  }
  return new URL("http://localhost:3000");
}
