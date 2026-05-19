import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/:locale/amaia", destination: "/:locale/chatbot", permanent: false },
      // Legacy /textes/[slug] → /textes/jo-ga/[slug] (heuristique : corpus principal gabonais).
      // Les slugs OHADA/CEMAC/COBAC doivent désormais utiliser /textes/<source>/<slug> directement.
      { source: "/:locale/textes/:slug", destination: "/:locale/textes/jo-ga/:slug", permanent: true },
      // Page Méthodologie supprimée — redirection 301 vers la home pour préserver le SEO.
      { source: "/:locale/methodologie", destination: "/:locale", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
