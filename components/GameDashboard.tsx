"use client";

import {
  CYCLES,
  GAME_NAMES,
  GROUPS,
  GROUP_IDS,
  TEAMS,
  animalForGameOne,
  groupForCharacter,
  type GameMaster,
  type Team,
} from "@/lib/config";
import { isCharacterAllowed, visibleIndex } from "@/lib/game";
import { useGameState } from "@/components/StateProvider";
import { LoadingState } from "@/components/LoadingState";
import { TeamMark } from "@/components/TeamMark";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TeamCycleCard({ gameMaster, team }: { gameMaster: GameMaster; team: Team }) {
  const { state, pending, advance } = useGameState();
  if (!state) return null;

  const cycle = CYCLES[gameMaster];
  const exclusions = state.exclusions[team];
  const currentIndex = visibleIndex(gameMaster, state.progress[gameMaster][team], exclusions);
  const currentCharacter = currentIndex === null ? null : cycle[currentIndex];
  const animal = gameMaster === 1 && currentCharacter ? animalForGameOne(currentCharacter) : null;
  const availableCount = cycle.filter((character) => isCharacterAllowed(character, exclusions)).length;
  const isPending = pending.has(`progress-${gameMaster}-${team}`);

  return (
    <article className={`cycle-card${currentCharacter ? "" : " complete"}`}>
      <div className="card-topline">
        <div className="team-identity">
          <TeamMark team={team} />
          <div>
            <small>Équipe</small>
            <h2>{team}</h2>
          </div>
        </div>
        <span className="available-count">{availableCount}<small>/10 actifs</small></span>
      </div>

      <div className="oracle-answer">
        <span className="answer-label">Personnage à faire deviner</span>
        {currentCharacter ? (
          <div className="answer-name-line">
            <strong>{currentCharacter}</strong>
            {animal && <span className="animal-pill">{animal}</span>}
          </div>
        ) : (
          <strong className="finished-label">Parcours terminé</strong>
        )}
        <span className="answer-note">
          {currentCharacter
            ? `Groupe ${groupForCharacter(currentCharacter)} · position ${(currentIndex ?? 0) + 1}`
            : "Tous les groupes sont cochés sur la page de contrôle"}
        </span>
      </div>

      <div className="cycle-strip" aria-label={`Cycle de ${team}`}>
        {cycle.map((character, index) => {
          const blocked = !isCharacterAllowed(character, exclusions);
          const active = index === currentIndex;
          return (
            <span
              key={`${character}-${index}`}
              className={`cycle-segment${blocked ? " blocked" : ""}${active ? " current" : ""}`}
              title={`${index + 1}. ${character}${blocked ? " — retiré" : ""}`}
              aria-label={`${character}${blocked ? ", retiré" : active ? ", actuel" : ""}`}
            >
              <i>{index + 1}</i>
            </span>
          );
        })}
      </div>

      <button
        type="button"
        className="advance-button"
        disabled={!currentCharacter || isPending}
        onClick={() => void advance(gameMaster, team)}
      >
        <span>{isPending ? "Enregistrement…" : "Équipe passée · suivant"}</span>
        <PlusIcon />
      </button>
    </article>
  );
}

export function GameDashboard({ gameMaster }: { gameMaster: GameMaster }) {
  const { state } = useGameState();

  if (!state) return <LoadingState />;

  return (
    <div className="page-wrap game-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Poste de jeu</span>
          <h1>{GAME_NAMES[gameMaster]} <em>{String(gameMaster).padStart(2, "0")}</em></h1>
        </div>
        <p>
          Accueille l’équipe, fais-lui deviner le personnage affiché, puis appuie sur
          <strong> suivant</strong> à son départ.
        </p>
      </section>

      <section className="cycles-grid" aria-label="Progression des cinq équipes">
        {TEAMS.map((team) => (
          <TeamCycleCard key={team} gameMaster={gameMaster} team={team} />
        ))}
      </section>

      <aside className="tip-bar">
        <span aria-hidden="true">✦</span>
        La boucle revient automatiquement au début. Les segments barrés sont ignorés selon la page de contrôle.
      </aside>
    </div>
  );
}
