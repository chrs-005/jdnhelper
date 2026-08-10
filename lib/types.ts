import type { GameMaster, GroupId, Team } from "@/lib/config";

export type TeamExclusions = Record<GroupId, boolean>;
export type Exclusions = Record<Team, TeamExclusions>;
export type Progress = Record<GameMaster, Record<Team, number>>;

export interface GameState {
  progress: Progress;
  exclusions: Exclusions;
  updatedAt: string;
}
