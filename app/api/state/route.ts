import { NextResponse } from "next/server";
import { readState } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const state = await readState();
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Unable to load game state", error);
    const missingDatabase = error instanceof Error && error.message === "DATABASE_URL_MISSING";
    return NextResponse.json(
      {
        error: missingDatabase
          ? "La base de données n’est pas configurée. Ajoutez DATABASE_URL."
          : "Impossible de joindre la base de données.",
      },
      { status: missingDatabase ? 503 : 500 },
    );
  }
}
