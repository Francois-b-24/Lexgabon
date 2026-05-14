"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!supabase) {
      setMsg(t("supabaseMissing"));
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setMsg(error ? error.message : t("linkSent"));
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-8">
      <h1 className="font-app-serif text-2xl font-semibold">{t("signIn")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("magicLinkHelp")}</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-lg-gold/40"
        />
        <button type="submit" className="w-full rounded-lg bg-lg-gold py-2 text-sm font-semibold text-lg-navy">
          {t("receiveLink")}
        </button>
      </form>
      {msg && <p className="mt-4 text-sm text-lg-gold-light">{msg}</p>}
      <p className="mt-6 text-center text-sm text-white/40">
        <Link href="/inscription" className="text-lg-gold hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
