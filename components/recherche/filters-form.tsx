"use client";

import { useRef, type FormEvent, type ReactNode } from "react";

/**
 * Wrapper client autour du formulaire de recherche.
 *
 * - Conserve le rendu SSR de tous les enfants (champs, pills, boutons).
 * - Auto-submit quand un filtre est modifié (checkbox, radio mode, date).
 * - Pas d'auto-submit sur la saisie du champ texte `q` (sinon une recherche
 *   part à chaque touche). Le bouton « Rechercher » reste l'unique déclencheur
 *   pour le champ texte.
 * - Reset systématique du `page=1` lors d'un changement de filtre.
 */
export function FiltersForm({ children }: { children: ReactNode }) {
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleChange(e: FormEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement & { name?: string; type?: string };
    if (!target || !target.name) return;
    // On exclut le champ texte principal `q` : il a son propre bouton submit.
    if (target.name === "q") return;
    // Sécurise le reset de pagination quand on touche aux filtres.
    const form = formRef.current;
    if (form) {
      const existingPage = form.querySelector<HTMLInputElement>('input[name="page"]');
      if (existingPage) existingPage.remove();
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      method="get"
      action="/recherche"
      onChange={handleChange}
      className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:p-5"
    >
      {children}
    </form>
  );
}
