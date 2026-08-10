# Oracle des Dieux — assistant JDN

Application synchronisée pour les cinq game masters du jeu de nuit. Chaque poste affiche le prochain personnage à faire deviner aux cinq équipes. La page de contrôle peut retirer les groupes A, B ou C du parcours d’une équipe en direct.

## Pages

- `/main` — contrôle des groupes terminés par équipe
- `/game/1` à `/game/5` — écrans des game masters
- `/1` à `/5` — raccourcis vers les mêmes écrans

## Lancer en local

Prérequis : Node.js 20+ et une base PostgreSQL.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Renseigner `DATABASE_URL` dans `.env.local`. Les deux tables sont créées automatiquement au premier appel de l’API ; aucune migration manuelle n’est nécessaire.

## Déployer sur Vercel

1. Importer ce dépôt dans Vercel.
2. Dans le projet Vercel, ouvrir **Storage / Marketplace** et créer une base **Neon Postgres**.
3. Connecter la base au projet et vérifier qu’une variable `DATABASE_URL` est disponible dans les environnements Production, Preview et Development.
4. Déployer. Le build command est `npm run build` et le framework est détecté automatiquement comme Next.js.
5. Ouvrir `/main` une première fois pour créer les tables, puis partager `/game/1` … `/game/5` avec les game masters.

La synchronisation se fait toutes les deux secondes et immédiatement après chaque action. Les avancées concurrentes d’un même poste sont verrouillées dans une transaction PostgreSQL.

## Groupes de personnages

- A : Zeus, Thésée, Héra
- B : Persée, Hermès, Athéna, Andromède
- C : Ulysse, Circé, Pénélope
