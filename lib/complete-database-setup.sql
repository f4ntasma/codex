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
--  Row Level Security (RLS)
-- =========================================
-- Habilitar RLS en todas las tablas
alter table public.projects enable row level security;
alter table public.profiles enable row level security;
alter table public.project_views enable row level security;
alter table public.project_comments enable row level security;

-- =========================================
--  Policies para projects
-- =========================================
-- Policy lectura pública
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='projects' and policyname='Projects are viewable by everyone'
  ) then
    create policy "Projects are viewable by everyone" on public.projects
      for select using (status = 'published');
  end if;
end$$;

-- Policy admin para projects
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='projects' and policyname='Admins can do everything on projects'
  ) then
    create policy "Admins can do everything on projects" on public.projects
      for all using (auth.role() = 'service_role');
  end if;
end$$;

-- =========================================
--  Policies para profiles
-- =========================================
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

-- Policy para admins en profiles
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

-- =========================================
--  Policies para project_views
-- =========================================
-- Insertar vistas (tracking)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_views' and policyname='insert views'
  ) then
    create policy "insert views" on public.project_views
      for insert with check (true);
  end if;
end$$;

-- Leer vistas (solo admins)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_views' and policyname='read views'
  ) then
    create policy "read views" on public.project_views
      for select using (auth.role() = 'service_role');
  end if;
end$$;

-- =========================================
--  Policies para project_comments
-- =========================================
-- Leer comentarios
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_comments' and policyname='read comments'
  ) then
    create policy "read comments" on public.project_comments
      for select using (true);
  end if;
end$$;

-- Insertar comentarios
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_comments' and policyname='insert comments'
  ) then
    create policy "insert comments" on public.project_comments
      for insert with check (true);
  end if;
end$$;

-- =========================================
--  Función de búsqueda full-text
-- =========================================
create or replace function public.search_projects(search_term text)
returns table (
  id integer,
  title varchar(255),
  description text,
  author varchar(255),
  author_avatar varchar(500),
  tags text[],
  stars integer,
  image varchar(500),
  github_url varchar(500),
  demo_url varchar(500),
  featured boolean,
  status varchar(20),
  created_at timestamptz,
  updated_at timestamptz,
  rank real
) as $$
begin
  return query
  select
    p.*,
    ts_rank(
      to_tsvector('spanish', p.title || ' ' || p.description || ' ' || p.author || ' ' || array_to_string(p.tags, ' ')),
      plainto_tsquery('spanish', search_term)
    ) as rank
  from public.projects p
  where p.status = 'published'
    and to_tsvector('spanish', p.title || ' ' || p.description || ' ' || p.author || ' ' || array_to_string(p.tags, ' '))
        @@ plainto_tsquery('spanish', search_term)
  order by rank desc, p.stars desc;
end;
$$ language plpgsql;

-- =========================================
--  Datos de ejemplo
-- =========================================
-- Insert de ejemplo para projects (solo si no existen)
insert into public.projects (title, description, author, author_avatar, tags, stars, image, featured) values
('Sistema de Gestión Académica','Plataforma web completa para gestionar calificaciones, asistencias y horarios de estudiantes universitarios.','María González','/diverse-students-studying.png', array['React','Node.js','MongoDB'],45,'/placeholder.svg', true),
('App de Realidad Aumentada','Aplicación móvil que utiliza AR para visualizar modelos 3D de anatomía humana con fines educativos.','Carlos Ramírez','/developer-working.png', array['Unity','C#','ARCore'],67,'/placeholder.svg', true),
('Chatbot con IA','Asistente virtual inteligente para responder preguntas frecuentes de estudiantes sobre trámites universitarios.','Ana Martínez','/female-student.jpg', array['Python','TensorFlow','NLP'],89,'/placeholder.svg', true),
('E-commerce Sostenible','Marketplace para productos ecológicos con sistema de puntos por compras sustentables.','Luis Torres','/male-student.jpg', array['Next.js','Stripe','PostgreSQL'],52,'/placeholder.svg', false),
('Plataforma de Tutorías','Sistema de conexión entre estudiantes y tutores con videollamadas integradas y calendario compartido.','Sofia Hernández','/tutor-session.png', array['Vue.js','WebRTC','Firebase'],73,'/placeholder.svg', true),
('Juego Educativo de Matemáticas','Juego interactivo para aprender álgebra y geometría de forma divertida con niveles progresivos.','Diego Vargas','/game-developer.jpg', array['Phaser','JavaScript','Canvas'],41,'/placeholder.svg', false),
('Red Social Universitaria','Plataforma social exclusiva para estudiantes con grupos de estudio, eventos y foros de discusión.','Valentina Ruiz','/social-media-user.jpg', array['React Native','GraphQL','AWS'],95,'/placeholder.svg', true),
('Sistema de Biblioteca Digital','Repositorio digital con búsqueda avanzada, préstamos virtuales y recomendaciones personalizadas.','Roberto Sánchez','/librarian.png', array['Django','Elasticsearch','Docker'],58,'/placeholder.svg', false),
('App de Salud Mental','Aplicación para el bienestar estudiantil con meditaciones guiadas, seguimiento de ánimo y recursos de apoyo.','Camila López','/wellness-coach.jpg', array['Flutter','Dart','Supabase'],82,'/placeholder.svg', true),
('Simulador de Física','Herramienta interactiva para simular experimentos de física con visualizaciones en tiempo real.','Andrés Morales','/physics-student.jpg', array['Three.js','WebGL','TypeScript'],64,'/placeholder.svg', false)
on conflict do nothing;

-- =========================================
--  Configuración final
-- =========================================
-- Fija el search_path para las funciones
ALTER FUNCTION public.update_updated_at_column()
SET search_path = pg_catalog, public;

ALTER FUNCTION public.update_profiles_updated_at_column()
SET search_path = pg_catalog, public;

ALTER FUNCTION public.search_projects(text)
SET search_path = pg_catalog, public;

-- =======================================================
--  Función y Trigger para Asignación Automática de Roles
-- =======================================================

create or replace function public.assign_role_on_signup()
returns trigger as $$
declare
  user_role text;
  user_email text;
  email_domain text;
  is_student boolean;
  is_free_provider boolean;
begin
  -- Obtener el email del nuevo usuario
  user_email := new.email;
  email_domain := split_part(user_email, '@', 2);

  -- Lista de dominios educativos (puedes expandirla)
  is_student := email_domain like '%.edu' or
                email_domain like '%.edu.%' or
                email_domain like '%.ac.%';

  -- Lista de proveedores de correo gratuitos
  is_free_provider := email_domain in (
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'aol.com', 'icloud.com', 'protonmail.com', 'gmx.com'
  );

  -- Lógica de asignación de rol
  if is_student then
    user_role := 'student';
  elsif not is_free_provider then
    user_role := 'corporate';
  else
    -- Si es un proveedor gratuito y no es un dominio .edu, no se asigna rol y no se crea perfil.
    -- El usuario podrá iniciar sesión, pero no tendrá perfil ni acceso a funcionalidades.
    return null;
  end if;

  -- Insertar en la tabla de perfiles con el rol asignado
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), -- Usa el nombre si está, si no, la parte local del email
    user_role
  );

  return new;
end;
$$ language plpgsql security definer;

-- Crear el trigger que se ejecuta después de un nuevo registro
-- Lo borramos si ya existe para asegurar que siempre esté la última versión
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.assign_role_on_signup();


-- NOTA PARA EL ADMIN:
-- Para asignarte el rol de 'admin', regístrate normalmente.
-- Luego, ve a la tabla 'profiles' en Supabase y cambia manualmente tu 'role' a 'admin'.
-- Ejemplo: UPDATE public.profiles SET role = 'admin' WHERE email = 'tu-correo-admin@ejemplo.com';

-- Recarga el schema cache de PostgREST
notify pgrst, 'reload schema';
