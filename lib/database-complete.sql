-- =========================================
--  CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- =========================================
-- Este archivo contiene toda la configuración necesaria para la base de datos
-- Incluye: projects, profiles, project_views, project_comments

-- =========================================
--  Tabla: projects
-- =========================================
create table if not exists public.projects (
  id serial primary key,
  title varchar(255) not null,
  description text not null,
  author varchar(255) not null,
  author_avatar varchar(500),
  tags text[] default '{}',
  stars integer default 0,
  image varchar(500),
  github_url varchar(500),
  demo_url varchar(500),
  featured boolean default false,
  status varchar(20) default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para projects
create index if not exists idx_projects_status       on public.projects(status);
create index if not exists idx_projects_featured     on public.projects(featured);
create index if not exists idx_projects_created_at   on public.projects(created_at desc);
create index if not exists idx_projects_stars        on public.projects(stars desc);

-- =========================================
--  Tabla: profiles
-- =========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  role text not null check (role in ('student','corporate','admin')),
  avatar text,
  university text,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para profiles
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);

-- =========================================
--  Tabla: project_views
-- =========================================
create table if not exists public.project_views (
  id           bigserial primary key,
  project_id   integer not null references public.projects(id) on delete cascade,
  user_id      uuid null references auth.users(id) on delete set null,
  user_name    text null,
  user_role    text not null check (user_role in ('student','corporate','admin')),
  user_avatar  text null,
  viewed_at    timestamptz not null default now()
);

create index if not exists project_views_project_id_idx on public.project_views(project_id);
create index if not exists project_views_viewed_at_idx  on public.project_views(viewed_at);
create index if not exists project_views_user_id_idx    on public.project_views(user_id);

-- =========================================
--  Tabla: project_comments
-- =========================================
create table if not exists public.project_comments (
  id           bigserial primary key,
  project_id   integer not null references public.projects(id) on delete cascade,
  author       text null,
  content      text not null check (length(content) <= 2000),
  created_at   timestamptz not null default now()
);

create index if not exists project_comments_project_id_idx on public.project_comments(project_id);
create index if not exists project_comments_created_at_idx on public.project_comments(created_at);

-- =========================================
--  Funciones updated_at
-- =========================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_profiles_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================
--  Triggers updated_at
-- =========================================
-- Trigger para projects
do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'update_projects_updated_at'
      and n.nspname = 'public'
      and c.relname = 'projects'
  ) then
    create trigger update_projects_updated_at
    before update on public.projects
    for each row
    execute function public.update_updated_at_column();
  end if;
end$$;

-- Trigger para profiles
do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'update_profiles_updated_at'
      and n.nspname = 'public'
      and c.relname = 'profiles'
  ) then
    create trigger update_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.update_profiles_updated_at_column();
  end if;
end$$;

-- =========================================
--  Permisos para funciones (esto permite que usuarios autenticados las usen)
-- =========================================
alter function public.update_updated_at_column() security definer;
alter function public.update_profiles_updated_at_column() security definer;

