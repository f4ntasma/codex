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

-- Índices
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);

-- Función updated_at para profiles
create or replace function public.update_profiles_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger updated_at para profiles (idempotente)
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

-- RLS en profiles
alter table public.profiles enable row level security;

-- Policy para que los usuarios puedan ver su propio perfil
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Users can view own profile'
  ) then
    create policy "Users can view own profile" on public.profiles
      for select using (auth.uid() = id);
  end if;
end$$;

-- Policy para que los usuarios puedan actualizar su propio perfil
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Users can update own profile'
  ) then
    create policy "Users can update own profile" on public.profiles
      for update using (auth.uid() = id);
  end if;
end$$;

-- Policy para que los usuarios puedan insertar su propio perfil
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Users can insert own profile'
  ) then
    create policy "Users can insert own profile" on public.profiles
      for insert with check (auth.uid() = id);
  end if;
end$$;

-- Policy para admins (acceso completo)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Admins can do everything on profiles'
  ) then
    create policy "Admins can do everything on profiles" on public.profiles
      for all using (auth.role() = 'service_role');
  end if;
end$$;

-- Fija el search_path para la función
ALTER FUNCTION public.update_profiles_updated_at_column()
SET search_path = pg_catalog, public;
