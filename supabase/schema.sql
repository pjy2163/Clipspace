create table if not exists team_boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists team_clips (
  id text primary key,
  board_id uuid not null references team_boards(id) on delete cascade,
  content text not null,
  title text not null,
  type text not null,
  category text not null,
  favorite boolean not null default false,
  flagged boolean not null default false,
  image jsonb,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table team_boards enable row level security;
alter table team_clips enable row level security;

grant usage on schema public to service_role;
grant all on table team_boards to service_role;
grant all on table team_clips to service_role;
