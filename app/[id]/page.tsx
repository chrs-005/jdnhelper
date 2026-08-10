import { notFound, redirect } from "next/navigation";
import { isGameMaster } from "@/lib/config";

export default async function ShortGameMasterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameMaster = Number(id);
  if (!isGameMaster(gameMaster)) notFound();
  redirect(`/game/${gameMaster}`);
}
