# 🚀 Mission — CRM Freelance Maison & SaaS Contrats

> Démarrage : 2026-05-07 | Dernière mise à jour : 2026-05-10 | Statut : En cours — POC **figé réf.** (plus de dev actif) · Spec SaaS **v2.4** · plan MVP + DDL · journal session ci-dessous

**Où vit quoi (workspace `Dev Freelance/`)**

| Dossier | Rôle |
|---------|------|
| **`crm-freelance/`** | **Code SaaS** — Next, Nest, infra de dev, monorepo applicatif (chemins relatifs depuis la racine workspace). |
| **`.agents/projets/crm-freelance/`** | **Spec, agent, plan, DDL source, HTML spec** — référence produit / technique (ce fichier `contexte.md` est ici). |
| **`prospection/`** | **POC figé** — UX de référence uniquement. |

---

## Double périmètre

1. **POC local** (`prospection/`) — **référence figée** (UX / flux déjà validés pour bascule SaaS) ; **plus de développement produit** sur cette base — les règles paiement **US-007 / US-008** et conventions **HT/TTC** sont dans **`docs/db/schema-mvp.dbml`** et **`docs/db/001_schema_mvp.sql`** + **`decisions_modele_donnees_mvp`**.
2. **Produit SaaS cible** — **Gestionnaire de Contrats Freelance** (nom TBD), aligné sur le **Consensus V2** : dans la spec JSON, **MVP infra minimal** (Nest monolithe + Postgres unique + Mollie…) documenté à côté de la **trajectoire V2 aspirationnelle** (EDA/CQRS, bus, read models).

Specs machine + humain pour le Dev :  
`.agents/projets/crm-freelance/gestionnaire-contrats-freelance-spec.json` (**`decisions_modele_donnees_mvp`**, `matrice_*`, **`infra_phases`**, v**2.4**)  
`.agents/projets/crm-freelance/gestionnaire-contrats-freelance-spec.html` — **vue lecture** (cartes, matrice, personas, US, onglet **Infra** MVP vs V2, etc.) + toggle **JSON brut** par onglet ; `Vue complète` enchaîne toutes les sections. Régénération : `node scripts/build-spec-html.mjs` (réutilise `scripts/spec-viewer.bundle.js`).

Schémas MVP Postgres + DBML (**dbdiagram**) : **`docs/db/schema-mvp.dbml`**, DDL **`docs/db/001_schema_mvp.sql`**, lien décisions **`decisions_modele_donnees_mvp`** dans le même JSON spec.

**Implémentation MVP** se fait dans **`crm-freelance/`** à la racine du workspace. Plan par phases : **`docs/PLAN_DEVELOPPEMENT_MVP.md`** (ce dépôt agent). Pour Postgres local : modèle dans **`infra/docker-compose.yml`** — à **reproduire ou copier** sous `crm-freelance/infra/` au bootstrap du repo app (sans devoir re-préciser ce choix).

---

## Consensus V2 (rappel cadrage produit SaaS)

| Thème | Décision |
|--------|-----------|
| Problème | Les freelances FR manquent de visibilité contrats / devis / paiements ; outils dispersés (Word, Excel, Drive). |
| Cible principale | Marie — freelance en croissance (≈ 2–3 ans, 25–80 k€/an). |
| Promesse | « Devis → Contrat → Paiement → Suivi, tout dans un outil, zéro friction ». |
| Objectif business | 500 € MRR en 5–6 mois (≈ 26 clients × 19 €/mois). |
| Stack | **MVP doc** : voir `infra_phases.mvp_infra_minimal` dans le JSON. **Cible V2** : Next (Vercel) · Nest EDA/DDD/CQRS · Postgres write/read · RabbitMQ · Redis · OVH Object Storage · Auth Next · **Billing Mollie** |
| MVP scope | Migrer tout le POC (pipeline, CRM, interactions, tâches, projets kanban, documents, clients, devis, contrats, dashboard, alertes, paiements tels que définis produit, print, templates conditions). |
| Freemium | 3 prospects + 3 clients max gratuits puis abonnement Mollie. |
| UX contenu long | Éditeur **visuel** (toolbar) — pas de Markdown brut utilisateur ; stockage HTML ou MD en base. |
| Paiements | Pas de facture PDF interne en MVP ; **tracking** : facture envoyée (+ date + montant attendu) + montant reçu → statut **déduit** `non_payé` / `partiel` / `payé`. |
| Hors MVP (V2+) | E-sign (Yousign), e-invoice Chorus/Factur-X, Stripe lien paiement, FEC, multi-devise, partage assistant/compta, etc. |

---

## Contexte POC

Outil encore **exécutable** localement pour mémoire comportementale ou démos, mais **sans évolution de code** prévue : tout nouvel effort va sur le **SaaS** (`docs/PLAN_DEVELOPPEMENT_MVP.md`).

À retenir comme **comportements de référence** : pipeline → client → devis → contrat ; CRM lié ; impressions basiques ; données JSON historiques.

---

## État réel du POC (`prospection/`) — 2026-05-10

### Fichiers

```
prospection/
  data/
    prospects.json, contacts.json, interactions.json, tasks.json
    clients.json, devis.json, contrats.json
    projects.json, project_tasks.json, documents.json
  server.js      ← HTTP + CRUD + upload + convert + next-numero
  index.html     ← SPA (Dashboard, Pipeline, Contacts, …, Contrats)
```

### Déjà livré dans l’UI

- **Dashboard** : KPI CA signé HT, CA en cours, devis envoyés TTC, impayés agrégés, mini-pipeline, contrats actifs, devis récents, **alertes** (tâches en retard, contrats qui expirent, devis envoyés périmés, paiements en attente), liste tâches à faire, actions rapides.
- **Contrats** : CRUD, lignes, dates, TVA, statuts contrat (`brouillon` → `résilié`), lien devis source, **pré-remplissage** depuis un devis accepté, conditions type Markdown + aperçu, **print** CSS.
- **Devis → contrat** : bouton `→ Contrat` sur détail devis si statut `accepté` ; même logique côté modale création contrat depuis `openContratModal(null, clientId, devisId)`.
- **Conversion prospect → client** : API + bouton prospect ; **après succès**, navigation vers **fiche client** (`goto('clients', id)`).
- **Fiche client** : contacts, interactions, tâches, liste devis & contrats, KPI (legacy POC). Le **modèle cible** paiement (**US-007 / US-008**) et conventions **HT/TTC** sont dans **`docs/db/*`** et **`decisions_modele_donnees_mvp`** — implémentés uniquement dans le SaaS.
- **Documents** : **uniquement** rattachés à un **projet** (upload PDF) — pas encore module « Documents » global client/contrat (prévu SaaS MVP).

### API REST (POC)

| Méthode | Route | Action |
|--------|--------|--------|
| CRUD | `/api/prospects` … | Idem autres ressources |
| CRUD | `/api/contacts` | Filtres `?prospect_id=` `&client_id=` |
| CRUD | `/api/interactions` | Idem filtres |
| CRUD | `/api/tasks` | Idem filtres |
| CRUD | `/api/projects`, `/api/project_tasks` | — |
| CRUD | `/api/documents` | + `POST /api/upload` (PDF base64 → fichier) |
| CRUD | `/api/clients` | + `POST /api/convert-prospect/:id` |
| CRUD | `/api/devis`, `/api/contrats` | |
| GET | `/api/next-numero?type=devis\|contrats` | DEV-AAAA-NNN / CTR-AAAA-NNN |

### UX récentes figées dans le POC

- **Contacts / Interactions / Tâches** : colonne **`Lié à`** (priorité client converti puis prospect).
- **Post-conversion** : ouverture directe de la **fiche client** créée.

### Décisions techniques POC

- Pas de npm — `http` natif Node ; données JSON fichier.
- PDF : fenêtre dédiée + `window.print()` (pas Puppeteer).
- **Paiements POC** : champs **`paiement_statut`** + **`montant_paye`** sur le contrat — **héritage JSON uniquement** ; le **modèle Consensus** (colonnes sur contrat + **`contract_payment_lines`**, pas d’enum paiement en base) est dans **`001_schema_mvp.sql`** / **DBML**.

### Modèle contrat POC (résumé — archival)

Champs historiques JSON : `numero`, `client_id`, `devis_id?`, `statut`, `dates`, `taux_tva`, totaux, `lignes[]`, `conditions`, `paiement_statut`, `montant_paye`, timestamps. **Ne pas étendre** : migrer vers DDL SaaS à l’implémentation.

---

## Navigation sidebar (POC)

```
📊 Dashboard
VUES — Pipeline · Contacts · Interactions · Tâches
MISSIONS — Projets
CONTRATS — Clients · Devis · Contrats
```

---

## Séquences — POC vs SaaS

| # | Séquence | POC | SaaS MVP |
|---|----------|-----|----------|
| 1 | Clients + conversion prospect | ✅ | Bounded context Clients + événements |
| 3 | Devis (lignes, TVA, print) | ✅ | Idem + projections read |
| 4 | Contrats (lignes, dates, print, lien devis) | ✅ | Agrégat Contrat + events |
| 5 | Templates / Print contrat | ✅ (base) | Amélioration continue |
| 6 | Dashboard + alertes | ✅ (logique vue client) | Query read + sockets alertes |
| 7 | Devis → contrat | ✅ | Commande métier dédiée |
| 8 | Fiche client (historique) | ✅ partiel | Historique cross-agrégats |
| 10 | Paiements produit | Partiel / manuel POC | Module Paiements (règles Consensus) |
| 11 | Auth, multi-tenant, freemium | — | Must |
| 12 | Billing Mollie | — | Must |
| 13 | Documents globaux client/contrat | — | Must (élargir hors seul projet) |

---

## Prochaines étapes suggérées

**SaaS (Dev)**

- Piloter avec **`docs/PLAN_DEVELOPPEMENT_MVP.md`** (Phases 0 → 9) ; **MVP = Nest monolithe + Postgres** (`infra_phases.mvp_infra_minimal`), pas Rabbit/Redis tant que pas besoin mesuré. Trajectoire bus/read models = **V2** dans la spec JSON.
- Appliquer `docs/db/001_schema_mvp.sql` après Postgres Docker (`infra/docker-compose.yml`).

---

## Journal — session 2026-05-10

Récapitulatif des livrables et décisions enregistrés ce jour (hors liste exhaustive des commits).

### POC `prospection/`

- Règle **navigation « Lié à »** : priorité **fiche client** si résolution possible (`resolveLinkedClient` / `orgNavTarget` / `orgLinkCell`) ; sinon prospect pipeline.
- Étendue aux **contacts, interactions, tâches**, dashboard (alertes / tâches), **liste clients** (colonne prospect source ouvre la fiche client), **projets** (liste + détail résolution client), **listes détails devis/contrats** via `resolveLinkedClient` ; **converti** → bouton **Fiche client** sur fiche prospect.
- Harmonisation fonctionnelle avec la spec liste CRM (une colonne lien plutôt que deux où pertinent).

### Spec produit & technique (`gestionnaire-contrats-freelance-spec.json`)

- Passage **v2.3 → v2.4** ; bloc **`infra_phases`** : **MVP infra minimal** vs **V2 aspirationnel** (dual-track sans changer le périmètre fonctionnel).
- Corrections Thomas / alignement doc : règle **`Lié à`** (matrice **`CRM-VIS-01`**, **US-001 à 003**, diagrammes, parcours UX), paiement (**`payment_lines`**, bounded context **Paiements**), **`NOT-RGL-01`** (refetch vs temps réel), gestion erreurs **Mollie** (sans mention Stripe générique conflicting), clarification **expiration devis**, **`flux_par_phase`**.
- **`decisions_modele_donnees_mvp`** figé après atelier utilisateur : 1 utilisateur = 1 tenant sans partage ; colonnes **_ht / _ttc** ; pas d’enum **paiement_statut** en base (dérivation appli) ; lignes **devis/contrats** normalisées ; documents **polymorphes** ; tables **Mollie** (`users`, `subscriptions`, paiements SaaS distincts du paiement **métier client**) ; **`alerts`** historisées avec **snooze** ; unicité **client × prospect_id** ; politique pas de hard delete devis envoyé / contrat signé ; traçabilité artefacts **DBML/ddl**.

### Schémas & artefacts base

- **`docs/db/schema-mvp.dbml`** (dbdiagram.io) ; **`docs/db/001_schema_mvp.sql`** (DDL Postgres aligné décisions).
- Répertoire **`docs/db/README.txt`** et renvois depuis la spec (**`artefacts_versionnes`**).

### Spec HTML viewer

- Tables **Stack** depuis **`infra_phases`** (blocs MVP puis V2) ; **flux par phase** depuis **`flux_par_phase`** ; nouvel onglet **Infra** (cartes règle UI Lié à, stacks, hors-scope MVP) ; **Vue complète** réordonnée (section Infra avant Tech).

### Implémentation MVP — plan & Docker

- **`docs/PLAN_DEVELOPPEMENT_MVP.md`** : phases 0 → 9 (Postgres Docker, Nest, auth/tenant, domaines métier dans l’ordre des FK, Next, print, Mollie, prod, Docker full-stack optionnel).
- **`infra/docker-compose.yml`** (Postgres 16) ; **`infra/.env.example`**.
- Références ajoutées dans ce **`contexte.md`** et dans **`decisions_modele_donnees_mvp.10_diagrammes_outillage.artefacts_versionnes`**.

### À faire après cette session

- Repo SaaS **`crm-freelance/`** : **Phase 0** (compose + DDL) puis bootstrap **`apps/api`** et **`apps/web`** selon **`docs/PLAN_DEVELOPPEMENT_MVP.md`**. **US-007 / US-008** suivent **`docs/db/*`** — plus de poursuite POC.

---

## Historique validations (archive)

Les séquences 1 et 3 détaillées (server + `index.html` devis/clients init) restent valides comme fondation ; le présent fichier remplace les tableaux obsolètes « contrats / dashboard à venir ».
