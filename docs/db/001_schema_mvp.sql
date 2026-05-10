-- MVP PostgreSQL schema — alignment spec v2.4 + gestionnaire-contrats-freelance decisions_modele_donnees_mvp
-- Source diagramme DBML parallèle : schema-mvp.dbml (dbdiagram.io)
-- À exécuter sur une base vierge Postgres 14+ ; adapter schéma cible si besoin (ex. CREATE SCHEMA).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── AUTH & BILLING SAAS ───────────────────────────────────────────────────────

CREATE TABLE users (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email                    varchar(320) NOT NULL UNIQUE,
    email_verified_at        timestamptz,
    password_hash            varchar,
    mollie_customer_id       varchar(40),
    mollie_mandate_id        varchar(40),
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_print_profiles (
    user_id                  uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    denomination             varchar(512) NOT NULL,
    email_contact            varchar(320),
    telephone                varchar(64),
    adresse                  varchar(2048),
    siret                    varchar(32),
    tva_intracommunautaire   varchar(32),
    applique_tva_par_defaut  boolean NOT NULL DEFAULT true,
    mentions_legales         text,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
    id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    mollie_subscription_id    varchar(40) NOT NULL UNIQUE,
    status                    varchar(32) NOT NULL,
    plan_id                   varchar(64) NOT NULL,
    currency                  char(3) NOT NULL DEFAULT 'EUR',
    next_payment_date         date,
    ends_at                   timestamptz,
    raw_payload_snapshot      jsonb,
    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);

CREATE TABLE subscription_payments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id     uuid NOT NULL REFERENCES subscriptions (id) ON DELETE CASCADE,
    user_id             uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    mollie_payment_id   varchar(40) NOT NULL UNIQUE,
    amount_cents        bigint NOT NULL,
    currency            char(3) NOT NULL,
    status              varchar(32) NOT NULL,
    paid_at             timestamptz,
    failure_reason      varchar(512),
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_payments_sub ON subscription_payments (subscription_id);

-- ── MÉTIER (tenant_id = users.id au MVP) ─────────────────────────────────────

CREATE TABLE prospects (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    nom             varchar(512) NOT NULL,
    statut          varchar(64) NOT NULL,
    type_contrat    varchar(64) NOT NULL,
    role_visé       varchar(512),
    site_web        varchar(1024),
    score           smallint NOT NULL DEFAULT 0,
    notes           text,
    archived_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prospects_tenant ON prospects (tenant_id);

CREATE TABLE clients (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    prospect_id     uuid REFERENCES prospects (id) ON DELETE SET NULL,
    nom             varchar(512) NOT NULL,
    email           varchar(320),
    telephone       varchar(64),
    adresse         varchar(2048),
    siret           varchar(32),
    notes           text,
    archived_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_tenant ON clients (tenant_id);
CREATE UNIQUE INDEX uq_clients_tenant_prospect ON clients (tenant_id, prospect_id)
    WHERE prospect_id IS NOT NULL;

CREATE TABLE contacts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    prospect_id     uuid REFERENCES prospects (id) ON DELETE SET NULL,
    client_id       uuid REFERENCES clients (id) ON DELETE SET NULL,
    nom             varchar(512) NOT NULL,
    role_interne    varchar(256),
    email           varchar(320),
    linkedin        varchar(512),
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_tenant ON contacts (tenant_id);

CREATE TABLE interactions (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    prospect_id      uuid REFERENCES prospects (id) ON DELETE SET NULL,
    client_id        uuid REFERENCES clients (id) ON DELETE SET NULL,
    contact_id       uuid REFERENCES contacts (id) ON DELETE SET NULL,
    type_evenement   varchar(64) NOT NULL,
    date_evenement   date NOT NULL,
    resume           varchar(4096),
    notes            text,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_tenant ON interactions (tenant_id);

CREATE TABLE tasks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    prospect_id     uuid REFERENCES prospects (id) ON DELETE SET NULL,
    client_id       uuid REFERENCES clients (id) ON DELETE SET NULL,
    titre           varchar(1024) NOT NULL,
    date_echeance   date,
    statut          varchar(64) NOT NULL,
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_tenant ON tasks (tenant_id);
CREATE INDEX idx_tasks_echeance ON tasks (tenant_id, date_echeance);

CREATE TABLE projects (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    client_id           uuid REFERENCES clients (id) ON DELETE SET NULL,
    prospect_id         uuid REFERENCES prospects (id) ON DELETE SET NULL,
    nom                 varchar(512) NOT NULL,
    date_debut_prevue   date,
    date_fin_prevue     date,
    statut              varchar(64),
    notes               text,
    archived_at         timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_projects_one_link CHECK (
        client_id IS NOT NULL OR prospect_id IS NOT NULL
    )
);

CREATE INDEX idx_projects_tenant ON projects (tenant_id);

CREATE TABLE project_tasks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    project_id      uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    titre           varchar(1024) NOT NULL,
    statut          varchar(64) NOT NULL,
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_tasks_project ON project_tasks (project_id);

CREATE TABLE devis (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    client_id           uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
    numero              varchar(64) NOT NULL,
    statut              varchar(32) NOT NULL,
    date_validite       date,
    taux_tva            numeric(7, 4) NOT NULL DEFAULT 0,
    conditions          text,
    notes               text,
    totals_total_ht     numeric(14, 4) NOT NULL DEFAULT 0,
    totals_tva_amount   numeric(14, 4) NOT NULL DEFAULT 0,
    totals_total_ttc    numeric(14, 4) NOT NULL DEFAULT 0,
    archived_at         timestamptz,
    sent_at             timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_devis_tenant_numero UNIQUE (tenant_id, numero)
);

CREATE INDEX idx_devis_tenant ON devis (tenant_id);

CREATE TABLE lignes_devis (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    devis_id            uuid NOT NULL REFERENCES devis (id) ON DELETE CASCADE,
    position            smallint NOT NULL DEFAULT 0,
    description         varchar(4096),
    quantite            numeric(14, 6) NOT NULL DEFAULT 1,
    prix_unitaire_ht    numeric(14, 4) NOT NULL DEFAULT 0,
    montant_ht          numeric(14, 4) NOT NULL DEFAULT 0,
    montant_ttc         numeric(14, 4) NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lignes_devis_parent ON lignes_devis (devis_id);

CREATE TABLE contrats (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    client_id             uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
    devis_id              uuid REFERENCES devis (id) ON DELETE SET NULL,
    numero                varchar(64) NOT NULL,
    statut                varchar(32) NOT NULL,
    date_debut            date,
    date_fin              date,
    taux_tva              numeric(7, 4) NOT NULL DEFAULT 0,
    conditions            text,
    notes                 text,
    totals_total_ht       numeric(14, 4) NOT NULL DEFAULT 0,
    totals_tva_amount     numeric(14, 4) NOT NULL DEFAULT 0,
    totals_total_ttc      numeric(14, 4) NOT NULL DEFAULT 0,
    archived_at           timestamptz,
    facture_envoyee       boolean NOT NULL DEFAULT false,
    date_envoi_facture    date,
    montant_attendu_ht    numeric(14, 4),
    montant_attendu_ttc   numeric(14, 4),
    signed_at             timestamptz,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_contrats_tenant_numero UNIQUE (tenant_id, numero)
);

CREATE INDEX idx_contrats_tenant ON contrats (tenant_id);

CREATE TABLE lignes_contrat (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    contrat_id          uuid NOT NULL REFERENCES contrats (id) ON DELETE CASCADE,
    position            smallint NOT NULL DEFAULT 0,
    description         varchar(4096),
    quantite            numeric(14, 6) NOT NULL DEFAULT 1,
    prix_unitaire_ht    numeric(14, 4) NOT NULL DEFAULT 0,
    montant_ht          numeric(14, 4) NOT NULL DEFAULT 0,
    montant_ttc         numeric(14, 4) NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lignes_contrat_parent ON lignes_contrat (contrat_id);

CREATE TABLE contract_payment_lines (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    contrat_id          uuid NOT NULL REFERENCES contrats (id) ON DELETE CASCADE,
    date_encaissement   date NOT NULL,
    montant_ht          numeric(14, 4),
    montant_ttc         numeric(14, 4),
    libelle_interne     varchar(512),
    created_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_payment_line_amount CHECK (
        montant_ht IS NOT NULL OR montant_ttc IS NOT NULL
    )
);

CREATE INDEX idx_cpl_contrat ON contract_payment_lines (contrat_id);

CREATE TABLE documents (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    storage_key      varchar(1024) NOT NULL,
    fichier_nom      varchar(512) NOT NULL,
    mime_type        varchar(192),
    taille_octets    bigint,
    nom_affichage    varchar(512),
    project_id       uuid REFERENCES projects (id) ON DELETE CASCADE,
    client_id        uuid REFERENCES clients (id) ON DELETE RESTRICT,
    contrat_id       uuid REFERENCES contrats (id) ON DELETE RESTRICT,
    created_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_document_single_owner CHECK (
        (project_id IS NOT NULL)::int
        + (client_id IS NOT NULL)::int
        + (contrat_id IS NOT NULL)::int
        = 1
    )
);

CREATE INDEX idx_documents_tenant ON documents (tenant_id);

CREATE TABLE alerts (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    code_type            varchar(64) NOT NULL,
    titre                varchar(512) NOT NULL,
    corps                text,
    payload_json         jsonb,
    entity_type          varchar(64),
    entity_id            uuid,
    source_generation    varchar(32) NOT NULL,
    read_at              timestamptz,
    dismissed_until      timestamptz,
    archived_at          timestamptz,
    created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_tenant ON alerts (tenant_id);
CREATE INDEX idx_alerts_snooze ON alerts (tenant_id, dismissed_until);

