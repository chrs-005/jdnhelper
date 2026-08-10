"use client";

import { GROUPS, GROUP_IDS, TEAMS, type GroupId, type Team } from "@/lib/config";
import { useGameState } from "@/components/StateProvider";
import { LoadingState } from "@/components/LoadingState";
import { TeamMark } from "@/components/TeamMark";

function GroupCheckbox({ team, groupId }: { team: Team; groupId: GroupId }) {
  const { state, pending, setGroupExcluded } = useGameState();
  if (!state) return null;

  const checked = state.exclusions[team][groupId];
  const isPending = pending.has(`exclusion-${team}-${groupId}`);

  return (
    <label className={`group-check${checked ? " checked" : ""}${isPending ? " pending" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(event) => void setGroupExcluded(team, groupId, event.target.checked)}
      />
      <span className="custom-checkbox" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="m3 8 3.2 3.2L13 4.7" /></svg>
      </span>
      <span className="group-copy">
        <strong>Groupe {groupId}</strong>
        <small>{GROUPS[groupId].join(" · ")}</small>
      </span>
      <span className="group-status">{checked ? "Terminé" : "À faire"}</span>
    </label>
  );
}

export function MainDashboard() {
  const { state } = useGameState();

  if (!state) return <LoadingState />;

  return (
    <div className="page-wrap control-page">
      <section className="page-heading control-heading">
        <div>
          <span className="eyebrow">Vue centrale</span>
          <h1>Poste de <em>contrôle</em></h1>
        </div>
        <p>
          Coche un groupe dès qu’une équipe n’a plus besoin de ses personnages. Tous les game masters
          ignoreront ces noms automatiquement.
        </p>
      </section>

      <section className="control-grid" aria-label="Exclusions par équipe">
        {TEAMS.map((team) => {
          const completed = GROUP_IDS.filter((groupId) => state.exclusions[team][groupId]).length;
          return (
            <article className="control-card" key={team}>
              <div className="control-card-head">
                <div className="team-identity">
                  <TeamMark team={team} large />
                  <div>
                    <small>Équipe</small>
                    <h2>{team}</h2>
                  </div>
                </div>
                <span className={`completion-badge${completed === 3 ? " done" : ""}`}>
                  {completed}/3 terminés
                </span>
              </div>
              <div className="group-list">
                {GROUP_IDS.map((groupId) => (
                  <GroupCheckbox key={groupId} team={team} groupId={groupId} />
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <aside className="control-note">
        <span className="note-icon" aria-hidden="true">i</span>
        <div>
          <strong>Modification immédiate</strong>
          <p>Un personnage retiré disparaît des cinq cycles de cette équipe. Le prochain nom valide prend sa place.</p>
        </div>
      </aside>
    </div>
  );
}
