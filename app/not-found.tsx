import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <span>404</span>
      <h1>Ce poste n’existe pas.</h1>
      <Link href="/main">Revenir au contrôle</Link>
    </div>
  );
}
