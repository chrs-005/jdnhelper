import { NextResponse } from "next/server";
import { advanceProgress } from "@/lib/db";
import { isGameMaster, isTeam } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const gameMaster = Number((body as { gameMaster?: unknown })?.gameMaster);
    const team = (body as { team?: unknown })?.team;

    if (!isGameMaster(gameMaster) || !isTeam(team)) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    return NextResponse.json(await advanceProgress(gameMaster, team));
  } catch (error) {
    console.error("Unable to advance progress", error);
    return NextResponse.json({ error: "La progression n’a pas pu être enregistrée." }, { status: 500 });
  }
}
