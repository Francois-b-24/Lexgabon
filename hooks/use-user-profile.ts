"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readProfileClient,
  writeProfileClient,
  type UserProfile,
} from "@/lib/user-profile";

/**
 * Hook client pour lire/écrire le profil utilisateur (cookie + localStorage).
 * Renvoie `profile = null` tant que le composant n'est pas hydraté (évite mismatch SSR).
 */
export function useUserProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfileState(readProfileClient());
    setHydrated(true);
  }, []);

  const setProfile = useCallback((next: UserProfile | null) => {
    writeProfileClient(next);
    setProfileState(next);
  }, []);

  return { profile, setProfile, hydrated };
}
