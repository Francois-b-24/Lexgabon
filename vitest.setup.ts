import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock du wrapper next-intl `@/i18n/navigation` : en test on n'a pas besoin du
// préfixe de locale ni du routeur Next. Un <Link> = <a>, un useRouter = noop.
vi.mock("@/i18n/navigation", async () => {
  const React = await import("react");
  return {
    Link: React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      function MockLink(props, ref) {
        return React.createElement("a", { ...props, ref });
      },
    ),
    usePathname: () => "/",
    useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {}, forward: () => {}, refresh: () => {} }),
    getPathname: () => "/",
    redirect: () => {},
  };
});

// next-intl `useTranslations` côté composants client : renvoie une fonction qui
// retourne la clé. Suffisant pour les assertions DOM des tests Vitest.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    if (!params) return key;
    return `${key} ${JSON.stringify(params)}`;
  },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
