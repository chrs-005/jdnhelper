"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GameMaster, GroupId, Team } from "@/lib/config";
import { advanceState } from "@/lib/game";
import type { GameState } from "@/lib/types";

type SyncStatus = "connecting" | "online" | "offline";

interface StateContextValue {
  state: GameState | null;
  status: SyncStatus;
  error: string | null;
  pending: ReadonlySet<string>;
  advance: (gameMaster: GameMaster, team: Team) => Promise<void>;
  setGroupExcluded: (team: Team, groupId: GroupId, excluded: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const StateContext = createContext<StateContextValue | null>(null);

async function requestState(url: string, init?: RequestInit): Promise<GameState> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = (await response.json()) as GameState | { error?: string };
  if (!response.ok) {
    throw new Error("error" in data && data.error ? data.error : "Erreur de synchronisation.");
  }
  return data as GameState;
}

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<SyncStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const pendingCount = useRef(0);

  const refresh = useCallback(async (force = false) => {
    if (!force && pendingCount.current > 0) return;
    try {
      const nextState = await requestState("/api/state");
      setState(nextState);
      setStatus("online");
      setError(null);
    } catch (requestError) {
      setStatus("offline");
      setError(requestError instanceof Error ? requestError.message : "Erreur de synchronisation.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  const beginPending = (key: string) => {
    pendingCount.current += 1;
    setPending((current) => new Set(current).add(key));
  };

  const endPending = (key: string) => {
    pendingCount.current = Math.max(0, pendingCount.current - 1);
    setPending((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };

  const advance = useCallback(async (gameMaster: GameMaster, team: Team) => {
    const key = `progress-${gameMaster}-${team}`;
    beginPending(key);
    setState((current) => (current ? advanceState(current, gameMaster, team) : current));
    try {
      const nextState = await requestState("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameMaster, team }),
      });
      setState(nextState);
      setStatus("online");
      setError(null);
    } catch (requestError) {
      setStatus("offline");
      setError(requestError instanceof Error ? requestError.message : "Erreur de synchronisation.");
      await refresh(true);
    } finally {
      endPending(key);
    }
  }, [refresh]);

  const setGroupExcluded = useCallback(async (team: Team, groupId: GroupId, excluded: boolean) => {
    const key = `exclusion-${team}-${groupId}`;
    beginPending(key);
    setState((current) => current ? {
      ...current,
      exclusions: {
        ...current.exclusions,
        [team]: { ...current.exclusions[team], [groupId]: excluded },
      },
    } : current);
    try {
      const nextState = await requestState("/api/exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team, groupId, excluded }),
      });
      setState(nextState);
      setStatus("online");
      setError(null);
    } catch (requestError) {
      setStatus("offline");
      setError(requestError instanceof Error ? requestError.message : "Erreur de synchronisation.");
      await refresh(true);
    } finally {
      endPending(key);
    }
  }, [refresh]);

  const value = useMemo<StateContextValue>(() => ({
    state,
    status,
    error,
    pending,
    advance,
    setGroupExcluded,
    refresh,
  }), [state, status, error, pending, advance, setGroupExcluded, refresh]);

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useGameState(): StateContextValue {
  const context = useContext(StateContext);
  if (!context) throw new Error("useGameState doit être utilisé dans StateProvider");
  return context;
}
