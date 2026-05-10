# Plan de développement — MVP SaaS (Next.js + Nest.js + PostgreSQL)

**Emplacement produit** : tout le **code applicatif** du SaaS dans le dossier **`crm-freelance/`** à la **racine du workspace** (`Dev Freelance/crm-freelance/`) — pas sous `.agents/projets/`. Le POC `prospection/` reste **référence UX** figée à la racine workspace.

**Sources de vérité** (à ne pas dupliquer hors sync) :

| Artefact | Chemin |
|---------|--------|
| Spec produit + matrice + infra + décisions données | `gestionnaire-contrats-freelance-spec.json` |
| Vue humaine | `gestionnaire-contrats-freelance-spec.html` |
| Schéma DDL MVP | `docs/db/001_schema_mvp.sql` |
| Diagramme | `docs/db/schema-mvp.dbml` |
| Infra MVP minimal | JSON → `infra_phases.mvp_infra_minimal` |

**Décision MVP infra** : monolithe Nest modulaire, Postgres schéma unique, pas de RabbitMQ/Redis obligatoires. Next sur Vercel en prod ; en dev **Next et Nest peuvent tourner en local** contre Postgres Docker.

---

## 1. Structure de dépôt cible (à créer à la Phase 0)

**Racine code** : **`crm-freelance/`** (voir `README.md` à cet emplacement — même niveau que `prospection/`, pas dans `.agents/`).

Les **documents de spec** (dont **ce** plan, le JSON, HTML, `docs/db/*.sql`) restent versionnés sous **`.agents/projets/crm-freelance/`** ; le repo app peut y faire référence en chemin relatif `../.agents/projets/crm-freelance/…` ou via copie ponctuelle du DDL.

```text
crm-freelance/                    ← workspace Dev Freelance/
  README.md
  infra/
    docker-compose.yml            ← copier / adapter depuis .agents/.../infra/ si besoin
    .env.example
  apps/
    api/                           ← NestJS
    web/                           ← Next.js App Router
  packages/                        ← (option) types partagés, Zod / OpenAPI

.agents/projets/crm-freelance/    ← spec, plan source, DDL source, contexte agent (hors crm-freelance/)
  docs/PLAN_DEVELOPPEMENT_MVP.md
  docs/db/
  gestionnaire-contrats-freelance-spec.json
  …
```

Le POC **`prospection/`** ne fusionne pas dans `apps/` : référence seulement.

---

## 2. Stack figée MVP

| Couche | Choix |
|--------|--------|
| API | NestJS 10+, ValidationPipe, `@nestjs/passport`/JWT ou intégration future NextAuth JWT |
| ORM | **À trancher** : Prisma (rapide DDL) ou TypeORM (proche decorators Nest) — les deux migrent depuis `001_schema_mvp.sql` |
| Frontend | Next.js 15+ App Router, Server Actions ou client fetch selon préférence |
| Cache client | TanStack Query (cf. NOT-RGL-01 MVP) |
| Auth | Session ou JWT tenant-scopé ; 1 utilisateur = 1 tenant (`users.id` = boundary) |
| DB | PostgreSQL 16 (Docker locale) |

---

## 3. Phase 0 — Socle DevOps local (PostgreSQL Docker)

**Livrables**

- `infra/docker-compose.yml` : service `postgres` + volume persistant + healthcheck.
- `infra/.env.example` : `DATABASE_URL`.
- Scripts racine ou `apps/api` : appliquer `docs/db/001_schema_mvp.sql` (migration manuelle puis tool ORM).

**Critère de sortie**

- Depuis **`crm-freelance/`** (infra y étant présente, cf. copie depuis `.agents/projets/crm-freelance/infra/`) :  
  `docker compose -f infra/docker-compose.yml up -d`
- Charger `infra/.env.example` → `.env` local avec `DATABASE_URL`, puis `\dt` sur `gestion_mvp` **après** exécution du DDL **source** `.agents/projets/crm-freelance/docs/db/001_schema_mvp.sql`.

**Hint Windows** — appliquer le DDL depuis la racine workspace (ajuster chemins si besoin) :  
`Get-Content .agents/projets/crm-freelance/docs/db/001_schema_mvp.sql | docker compose -f crm-freelance/infra/docker-compose.yml exec -T postgres psql -U gestion -d gestion_mvp`

**Ne pas encore** dockeriser Nest/Next (option Phase 9) pour garder les hot-reload natives.

---

## 4. Phase 1 — API Nest + accès données

**Ordre conseillé**

1. Bootstrap `apps/api` (CLI Nest), configuration `ConfigModule` + `DATABASE_URL`.
2. Intégrer ORM ; mapper entités aux tables du DDL (respect `tenant_id` partout métier).
3. Garde globale `@UseGuards` + décorateur `@CurrentUser()` → injecte `userId` = `tenant_id`.
4. Health route `GET /health` + `GET /version`.

**Critère de sortie**

- Une ressource lecture seule sécurisée (ex. `GET /api/v1/me` ou liste prospects vide) vérifiant le tenant sans fuite cross-tenant.

---

## 5. Phase 2 — Auth & inscription

**Livrables**

- Création compte + login (hash mot de passe ou OAuth selon décision courte).
- Ligne dans `users` + optionnellement `user_print_profiles` par défaut.
- quotas freemium : contrôle sur POST `prospects` / POST `clients` (matrice AUT-SEC-02 + US-009).

**Critère de sortie**

- Parcours : création compte → JWT/session → première requête métier scoped.

---

## 6. Phase 3 — Domaines métier (par blocs POC)

Répliquer le POC dans l’ordre de dépendances du schéma :

| Ordre | Module | Dépend |
|-------|--------|--------|
| 1 | `prospects` | — |
| 2 | `clients` (+ conversion depuis prospect, unicité `prospect_id`) | prospects |
| 3 | `contacts`, `tasks`, `interactions` | prospects, clients |
| 4 | `devis` + `lignes_devis` | clients |
| 5 | `contrats` + `lignes_contrat` + `contract_payment_lines` | clients, devis optional |
| 6 | `projects` + `project_tasks` | clients/prospects |
| 7 | `documents` (métadonnées + upload S3 OVH ensuite) | au moins une FK projet/client/contrat |
| 8 | `alerts` (génération + snooze `dismissed_until`) | données agrégées |

**Règles à implémenter dès ces modules**

- Soft delete / interdiction DELETE si devis envoyé ou contrat signé (`decisions_modele_donnees_mvp`).
- Nommages colonnes **`_ht` / `_ttc`** conformes décisions monet.
- Mapping POC : champ JSON `interactions.type` → colonne **`type_evenement`** (note dans la spec).

**Critère de sortie**

- Parité API fonctionnelle minimale avec le POC pour CRUD liste/détail (sans forcément même format d’erreur).

---

## 7. Phase 4 — Frontend Next (`apps/web`)

**Livrables**

- Layout app, navigation par blocs équivalent POC.
- Client API avec base URL configurable ; TanStack Query.
- Flux critique : liste prospects → fiche → conversion client → fiche client → devis → contrat.
- Alignement **`Lié à`** (infra `regle_ui_lien_organisationnel`).

**Critère de sortie**

- Marie peut refaire un parcours de bout en bout sur environnement staging local.

---

## 8. Phase 5 — Impression / PDF léger MVP

**Livrables**

- Routes `/print/devis/[id]` et `/print/contrat/[id]` (print CSS comme POC) ou génération serveur si tu préfères.

**Critère de sortie**

- PDF/navigateur imprimable utilisable hors ligne pour envoi mail client.

---

## 9. Phase 6 — Billing Mollie (SaaS)

**Livrables**

- Liaison premier paiement → `mollie_customer_id` / `mandate`.
- Tables `subscriptions` + `subscription_payments` hydratées par webhooks.
- Blocage quota freemium → CTA upgrade.

**Critère de sortie**

- Compte gratuit bloqué au-delà de 3+3 après test ; paiement fictif sandbox débloque.

---

## 10. Phase 7 — Observabilité & durcissement

- Logs structurés (pino/winston).
- Validation Zod/class-validator sur tous les POST/PATCH métier alignés lignes/normalisation.
- Tests e2e min sur conversion + paiement lignes.

---

## 11. Phase 8 — Déploiement MVP

| Cible | Rôle |
|-------|------|
| Vercel | `apps/web` |
| VPS OVH (ou équivalent) | `apps/api` derrière HTTPS + Postgres managé ou même host que précédemment défini |

Documenter secrets : `DATABASE_URL`, clés Mollie, buckets S3, `NEXT_PUBLIC_API_URL`.

---

## 12. Phase 9 (option) — Docker full stack prod-like

Dockerfiles Nest + Next + Compose multi-services pour previews ou CI ; **non obligatoire** pour démarrer le dev MVP.

---

## Définition de « MVP livré »

- Parcours spec : prospect → client → devis → contrat → **paiement métier via `contract_payment_lines`** + indicateurs dashboard cohérents HT/TTC.
- Billing SaaS Mollie opérationnel (abonnement + webhooks connus dans les tables prévues).
- Pas de Chorus / Factur-X / e-sign dans cette release.

---

## Prochain pas immédiat

1. Exécuter **Phase 0** (PostgreSQL Docker + appliquer `001_schema_mvp.sql`).
2. `nest new apps/api` + choix ORM.
3. Tiquer dans ce document les phases au fil de l’avancement (ou passer sur issues dans ton outil projet).
