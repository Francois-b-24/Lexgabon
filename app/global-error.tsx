"use client";

import { useEffect } from "react";

const bg = "#0b1f3a";
const gold = "#c49a2a";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: bg,
          color: "#f0ede6",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Une erreur est survenue</h1>
        <p style={{ maxWidth: "28rem", textAlign: "center", fontSize: "0.875rem", opacity: 0.75 }}>
          Veuillez réessayer. Si le problème persiste, contactez le support.
        </p>
        <button
          type="button"
          style={{
            border: "none",
            borderRadius: "0.5rem",
            background: gold,
            color: bg,
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => reset()}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
