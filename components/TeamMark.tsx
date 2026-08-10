import type { CSSProperties } from "react";
import { TEAM_META, type Team } from "@/lib/config";

export function TeamMark({ team, large = false }: { team: Team; large?: boolean }) {
  const meta = TEAM_META[team];
  return (
    <span
      className={`team-mark${large ? " large" : ""}`}
      style={{ "--team-color": meta.color } as CSSProperties}
      aria-hidden="true"
    >
      {meta.short}
    </span>
  );
}
