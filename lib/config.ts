export const TEAMS = ["Requin", "Bison", "Leops", "Panda", "Faucon"] as const;
export type Team = (typeof TEAMS)[number];

export const GAME_MASTERS = [1, 2, 3, 4, 5] as const;
export type GameMaster = (typeof GAME_MASTERS)[number];

export const GAME_NAMES: Record<GameMaster, string> = {
  1: "Answer wrong to the previous question",
  2: "Scalpe",
  3: "Contact",
  4: "Mix color Wordle",
  5: "Sensei cup egg remove",
};

export const GROUP_IDS = ["A", "B", "C"] as const;
export type GroupId = (typeof GROUP_IDS)[number];

export const GROUPS: Record<GroupId, readonly string[]> = {
  A: ["Zeus", "Thésée", "Héra"],
  B: ["Persée", "Hermès", "Athéna", "Andromède"],
  C: ["Ulysse", "Circé", "Pénélope"],
};

export const CYCLES: Record<GameMaster, readonly string[]> = {
  1: ["Circé", "Thésée", "Zeus", "Persée", "Ulysse", "Héra", "Pénélope", "Hermès", "Andromède", "Athéna"],
  2: ["Zeus", "Ulysse", "Héra", "Pénélope", "Circé", "Thésée", "Persée", "Andromède", "Athéna", "Hermès"],
  3: ["Persée", "Hermès", "Andromède", "Athéna", "Thésée", "Circé", "Zeus", "Ulysse", "Héra", "Pénélope"],
  4: ["Andromède", "Pénélope", "Hermès", "Thésée", "Zeus", "Persée", "Circé", "Athéna", "Ulysse", "Héra"],
  5: ["Héra", "Athéna", "Ulysse", "Circé", "Persée", "Zeus", "Thésée", "Pénélope", "Hermès", "Andromède"],
};

export const TEAM_META: Record<Team, { short: string; color: string }> = {
  Requin: { short: "RE", color: "#197e91" },
  Bison: { short: "BI", color: "#a46137" },
  Leops: { short: "LE", color: "#d59425" },
  Panda: { short: "PA", color: "#454844" },
  Faucon: { short: "FA", color: "#7d4b8e" },
};

const GAME_ONE_ANIMALS_BY_KEY: Record<string, string> = {
  ulysse: "Chien / Dog",
  zeus: "Aigle / Eagle",
  hermes: "Tortue / Tortoise",
  persee: "Cheval / Horse",
  andromede: "Dauphin / Dolphin",
  penelope: "Oie / Goose",
  hera: "Paon / Peacock",
  circe: "Grenouille / Frog",
  thesee: "Taureau / Bull",
};

export function animalForGameOne(character: string): string | null {
  const key = character
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return GAME_ONE_ANIMALS_BY_KEY[key] ?? null;
}

export function isTeam(value: unknown): value is Team {
  return typeof value === "string" && (TEAMS as readonly string[]).includes(value);
}

export function isGroupId(value: unknown): value is GroupId {
  return typeof value === "string" && (GROUP_IDS as readonly string[]).includes(value);
}

export function isGameMaster(value: unknown): value is GameMaster {
  return typeof value === "number" && (GAME_MASTERS as readonly number[]).includes(value);
}

export function groupForCharacter(character: string): GroupId {
  for (const groupId of GROUP_IDS) {
    if (GROUPS[groupId].includes(character)) return groupId;
  }
  throw new Error(`Groupe introuvable pour ${character}`);
}
