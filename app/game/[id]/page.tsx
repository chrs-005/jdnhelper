import { notFound } from "next/navigation";
import { GameDashboard } from "@/components/GameDashboard";
import { isGameMaster } from "@/lib/config";

export default async function GameMasterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameMaster = Number(id);
  if (!isGameMaster(gameMaster)) notFound();
  return <GameDashboard gameMaster={gameMaster} />;
}
