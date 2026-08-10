import postgres from "postgres";
import { GAME_MASTERS, GROUP_IDS, TEAMS, type GameMaster, type GroupId, type Team } from "@/lib/config";
import { emptyExclusions, emptyProgress, nextIndex, visibleIndex } from "@/lib/game";
import type { GameState } from "@/lib/types";

type SqlClient = ReturnType<typeof postgres>;

let client: SqlClient | undefined;
let initialization: Promise<void> | undefined;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL_MISSING");
  }
  return url;
}

function sqlClient(): SqlClient {
  if (!client) {
    client = postgres(databaseUrl(), {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return client;
}

async function ensureDatabase(): Promise<void> {
  if (!initialization) {
    const sql = sqlClient();
    initialization = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS helper_progress (
          game_master SMALLINT NOT NULL CHECK (game_master BETWEEN 1 AND 5),
          team VARCHAR(20) NOT NULL,
          cursor SMALLINT NOT NULL DEFAULT 0 CHECK (cursor BETWEEN 0 AND 9),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (game_master, team)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS helper_exclusions (
          team VARCHAR(20) NOT NULL,
          group_id CHAR(1) NOT NULL CHECK (group_id IN ('A', 'B', 'C')),
          excluded BOOLEAN NOT NULL DEFAULT FALSE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (team, group_id)
        )
      `;
    })().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}

export async function readState(): Promise<GameState> {
  await ensureDatabase();
  const sql = sqlClient();
  const [progressRows, exclusionRows] = await Promise.all([
    sql<{ game_master: number; team: string; cursor: number }[]>`
      SELECT game_master, team, cursor FROM helper_progress
    `,
    sql<{ team: string; group_id: string; excluded: boolean }[]>`
      SELECT team, group_id, excluded FROM helper_exclusions
    `,
  ]);

  const progress = emptyProgress();
  for (const row of progressRows) {
    if (
      (GAME_MASTERS as readonly number[]).includes(row.game_master) &&
      (TEAMS as readonly string[]).includes(row.team)
    ) {
      progress[row.game_master as GameMaster][row.team as Team] = row.cursor;
    }
  }

  const exclusions = emptyExclusions();
  for (const row of exclusionRows) {
    if (
      (TEAMS as readonly string[]).includes(row.team) &&
      (GROUP_IDS as readonly string[]).includes(row.group_id)
    ) {
      exclusions[row.team as Team][row.group_id as GroupId] = row.excluded;
    }
  }

  return { progress, exclusions, updatedAt: new Date().toISOString() };
}

export async function advanceProgress(gameMaster: GameMaster, team: Team): Promise<GameState> {
  await ensureDatabase();
  const sql = sqlClient();

  await sql.begin(async (transaction) => {
    await transaction`
      INSERT INTO helper_progress (game_master, team, cursor)
      VALUES (${gameMaster}, ${team}, 0)
      ON CONFLICT (game_master, team) DO NOTHING
    `;

    const [progressRow] = await transaction<{ cursor: number }[]>`
      SELECT cursor
      FROM helper_progress
      WHERE game_master = ${gameMaster} AND team = ${team}
      FOR UPDATE
    `;
    const exclusionRows = await transaction<{ group_id: string; excluded: boolean }[]>`
      SELECT group_id, excluded
      FROM helper_exclusions
      WHERE team = ${team}
    `;

    const exclusions = { A: false, B: false, C: false };
    for (const row of exclusionRows) {
      if ((GROUP_IDS as readonly string[]).includes(row.group_id)) {
        exclusions[row.group_id as GroupId] = row.excluded;
      }
    }

    const current = visibleIndex(gameMaster, progressRow.cursor, exclusions);
    if (current === null) return;
    const next = nextIndex(gameMaster, current, exclusions);
    if (next === null) return;

    await transaction`
      UPDATE helper_progress
      SET cursor = ${next}, updated_at = NOW()
      WHERE game_master = ${gameMaster} AND team = ${team}
    `;
  });

  return readState();
}

export async function setExclusion(team: Team, groupId: GroupId, excluded: boolean): Promise<GameState> {
  await ensureDatabase();
  const sql = sqlClient();
  await sql`
    INSERT INTO helper_exclusions (team, group_id, excluded, updated_at)
    VALUES (${team}, ${groupId}, ${excluded}, NOW())
    ON CONFLICT (team, group_id)
    DO UPDATE SET excluded = EXCLUDED.excluded, updated_at = NOW()
  `;
  return readState();
}
