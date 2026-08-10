import { NextResponse } from "next/server";
import { setExclusion } from "@/lib/db";
import { isGroupId, isTeam } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const team = (body as { team?: unknown })?.team;
    const groupId = (body as { groupId?: unknown })?.groupId;
    const excluded = (body as { excluded?: unknown })?.excluded;

    if (!isTeam(team) || !isGroupId(groupId) || typeof excluded !== "boolean") {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    return NextResponse.json(await setExclusion(team, groupId, excluded));
  } catch (error) {
    console.error("Unable to update exclusions", error);
    return NextResponse.json({ error: "La modification n’a pas pu être enregistrée." }, { status: 500 });
  }
}
