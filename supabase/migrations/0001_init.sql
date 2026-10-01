-- Ad Machine: basis-schema
-- Eén workspace per bedrijf/merk. Alles hangt aan een workspace.

create extension if not exists "pgcrypto";

create type ad_source as enum ('competitor', 'own');
create type ad_platform as enum ('meta', 'google', 'tiktok');
create type decision_action as enum ('kill', 'keep', 'scale');
create type decision_status as enum ('pending', 'approved', 'rejected', 'executed');

create table workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  niche       text,
  countries   text[] not null default '{NL}',
  created_at  timestamptz not null default now()
);

create table competitors (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  name          text not null,
  meta_page_id  text,
  website       text,
  notes         text,
  created_at    timestamptz not null default now()
);
create index on competitors (workspace_id);

-- Zowel concurrent-ads als eigen ads, zodat we ze met dezelfde tags kunnen vergelijken.
create table ads (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  competitor_id   uuid references competitors(id) on delete set null,
  source          ad_source not null,
  platform        ad_platform not null,
  external_id     text not null,
  page_name       text,
  body            text,
  title           text,
  link_url        text,
  cta             text,
  media_type      text,            -- 'video' | 'image' | 'carousel'
  media_urls      jsonb not null default '[]',
  snapshot_url    text,
  transcript      text,
  started_at      timestamptz,
  stopped_at      timestamptz,
  is_active       boolean not null default true,
  variant_count   int not null default 1,  -- hoeveel ads dezelfde creative/tekst delen
  raw             jsonb,
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  unique (workspace_id, platform, external_id)
);
create index on ads (workspace_id, source);

-- Output van Jev (tags + scores). Eén rij per ad, overschreven bij her-analyse.
create table ad_analysis (
  ad_id            uuid primary key references ads(id) on delete cascade,
  hook_type        text,
  angle            text,
  format           text,
  emotion          text,
  offer_type       text,
  creative_score   real,            -- Jev score 0..1 (kwaliteit creative)
  longevity_score  real,            -- berekend uit looptijd + varianten
  winner_score     real,            -- combinatie, 0..100
  confidence       jsonb not null default '{}',
  model            text,
  analyzed_at      timestamptz not null default now()
);

create table landing_pages (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  url           text not null,
  title         text,
  content       text,
  scraped_at    timestamptz not null default now(),
  unique (workspace_id, url)
);

-- Dagelijkse cijfers van eigen ads (Meta/Google/TikTok).
create table ad_metrics_daily (
  ad_id        uuid not null references ads(id) on delete cascade,
  date         date not null,
  spend        numeric(12,2) not null default 0,
  impressions  int not null default 0,
  clicks       int not null default 0,
  conversions  int not null default 0,
  revenue      numeric(12,2) not null default 0,
  primary key (ad_id, date)
);

-- Kill/keep/scale-adviezen. Worden pas uitgevoerd na goedkeuring.
create table decisions (
  id             uuid primary key default gen_random_uuid(),
  ad_id          uuid not null references ads(id) on delete cascade,
  action         decision_action not null,
  confidence     real not null,
  probabilities  jsonb not null default '{}',
  status         decision_status not null default 'pending',
  created_at     timestamptz not null default now(),
  decided_at     timestamptz
);
create index on decisions (ad_id, created_at desc);

-- RLS aan zonder policies: alleen de server (service role key) kan lezen/schrijven.
-- Login + per-gebruiker policies komen in een volgende migratie.
alter table workspaces       enable row level security;
alter table competitors      enable row level security;
alter table ads              enable row level security;
alter table ad_analysis      enable row level security;
alter table landing_pages    enable row level security;
alter table ad_metrics_daily enable row level security;
alter table decisions        enable row level security;
