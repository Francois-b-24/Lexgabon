/**
 * Helpers SEO partagés : URL canonique, JSON-LD Organization + WebSite.
 */

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://lexgabon.vercel.app"
  );
}

export function getOrgJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ALIN",
    legalName: "Africa Law Innovation Network",
    url: "https://alin-africa.com",
    sameAs: [url],
    description:
      "ALIN (Africa Law Innovation Network) est l'initiative qui porte LexGabon, plateforme d'accès ouvert au droit applicable au Gabon (Gabon, OHADA, CEMAC, COBAC).",
  };
}

export function getWebsiteJsonLd(locale: string) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LexGabon",
    url,
    inLanguage: locale,
    description:
      "Plateforme d'accès ouvert au droit applicable au Gabon : Journal officiel, OHADA, CEMAC, COBAC.",
    publisher: {
      "@type": "Organization",
      name: "ALIN",
      url: "https://alin-africa.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/${locale}/recherche?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
