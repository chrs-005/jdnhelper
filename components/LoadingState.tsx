export function LoadingState() {
  return (
    <div className="loading-state" aria-live="polite">
      <span className="loading-orbit" aria-hidden="true" />
      <strong>Consultation de l’oracle…</strong>
      <small>Synchronisation des parcours</small>
    </div>
  );
}
