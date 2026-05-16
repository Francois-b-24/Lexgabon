"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PROFILE_CHANGE_EVENT,
  readProfileClient,
  writeProfileClient,
  type UserProfile,
} from "@/lib/user-profile";

/**
 * Hook client pour lire/écrire le profil utilisateur (cookie + localStorage).
 *
 * Chaque appel crée son propre useState : pour qu'un changement déclenché par
 * un composant (ex. ProfileSwitcher du header) se propage à un autre (ex. les
 * QuestionSuggestions du chatbot), `writeProfileClient` émet un CustomEvent
 * que ce hook écoute. Bonus : `storage` synchronise aussi entre onglets.
 *
 * `profile = null` tant que le composant n'est pas hydraté (évite mismatch SSR).
 */
export function useUserProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfileState(readProfileClient());
    setHydrated(true);

    const onChange = () => setProfileState(readProfileClient());
    window.addEventListener(PROFILE_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(PROFILE_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setProfile = useCallback((next: UserProfile | null) => {
    writeProfileClient(next);
    setProfileState(next);
  }, []);

  return { profile, setProfile, hydrated };
}
