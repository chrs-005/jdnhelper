import {
  CYCLES,
  GAME_MASTERS,
  GROUP_IDS,
  TEAMS,
  groupForCharacter,
  type GameMaster,
  type Team,
} from "@/lib/config";
import type { Exclusions, GameState, Progress, TeamExclusions } from "@/lib/types";

export function emptyProgress(): Progress {
  return Object.fromEntries(
    GAME_MASTERS.map((gameMaster) => [
      gameMaster,
      Object.fromEntries(TEAMS.map((team) => [team, 0])),
    ]),
  ) as Progress;
}

export function emptyExclusions(): Exclusions {
  return Object.fromEntries(
    TEAMS.map((team) => [
      team,
      Object.fromEntries(GROUP_IDS.map((group) => [group, false])),
    ]),
  ) as Exclusions;
}

export function emptyState(): GameState {
  return {
    progress: emptyProgress(),
    exclusions: emptyExclusions(),
    updatedAt: new Date(0).toISOString(),
  };
}

export function isCharacterAllowed(character: string, exclusions: TeamExclusions): boolean {
  return !exclusions[groupForCharacter(character)];
}

export function visibleIndex(
  gameMaster: GameMaster,
  cursor: number,
  exclusions: TeamExclusions,
): number | null {
  const cycle = CYCLES[gameMaster];
  for (let offset = 0; offset < cycle.length; offset += 1) {
    const index = (cursor + offset) % cycle.length;
    if (isCharacterAllowed(cycle[index], exclusions)) return index;
  }
  return null;
}

export function nextIndex(
  gameMaster: GameMaster,
  current: number,
  exclusions: TeamExclusions,
): number | null {
  const cycle = CYCLES[gameMaster];
  for (let offset = 1; offset <= cycle.length; offset += 1) {
    const index = (current + offset) % cycle.length;
    if (isCharacterAllowed(cycle[index], exclusions)) return index;
  }
  return null;
}

export function advanceState(state: GameState, gameMaster: GameMaster, team: Team): GameState {
  const current = visibleIndex(gameMaster, state.progress[gameMaster][team], state.exclusions[team]);
  if (current === null) return state;

  const next = nextIndex(gameMaster, current, state.exclusions[team]);
  if (next === null) return state;

  return {
    ...state,
    progress: {
      ...state.progress,
      [gameMaster]: { ...state.progress[gameMaster], [team]: next },
    },
  };
}
