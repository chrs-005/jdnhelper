"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GAME_MASTERS, GAME_NAMES } from "@/lib/config";
import { useGameState } from "@/components/StateProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, error, refresh } = useGameState();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/main" className="brand" aria-label="Oracle des Dieux — accueil">
          <span className="brand-mark" aria-hidden="true">Ω</span>
          <span>
            <strong>Oracle des Dieux</strong>
            <small>Jeu de nuit · assistant</small>
          </span>
        </Link>

        <nav className="page-nav" aria-label="Navigation principale">
          <Link href="/main" className={pathname === "/main" ? "active" : ""}>Contrôle</Link>
          {GAME_MASTERS.map((number) => (
            <Link
              key={number}
              href={`/game/${number}`}
              className={pathname === `/game/${number}` ? "active" : ""}
              aria-label={`Game ${number}: ${GAME_NAMES[number]}`}
              title={GAME_NAMES[number]}
            >
              GM {number}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={`sync-pill ${status}`}
          onClick={() => void refresh()}
          title={error ?? "Données synchronisées"}
        >
          <span className="sync-dot" />
          {status === "online" ? "En direct" : status === "connecting" ? "Connexion" : "Hors ligne"}
        </button>
      </header>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>Réessayer</button>
        </div>
      )}
      <main>{children}</main>
    </div>
  );
}
