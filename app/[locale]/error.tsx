"use client";

import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[locale-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="font-app-serif text-xl font-semibold text-white">Impossible d&apos;afficher cette page</h1>
      <p className="max-w-md text-sm text-white/55">
        Une erreur technique s&apos;est produite. Vous pouvez réessayer ; si le problème continue après déploiement,
        vérifiez les variables d&apos;environnement (URL du site, base de données, clés API).
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-lg-gold px-5 py-2.5 text-sm font-semibold text-lg-navy"
      >
        Réessayer
      </button>
    </div>
  );
}
