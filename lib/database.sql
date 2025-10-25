-- Crear tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  stars INTEGER DEFAULT 0,
  image VARCHAR(500),
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_stars ON projects(stars DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo (migrar desde el código hardcodeado)
INSERT INTO projects (title, description, author, author_avatar, tags, stars, image, featured) VALUES
('Sistema de Gestión Académica', 'Plataforma web completa para gestionar calificaciones, asistencias y horarios de estudiantes universitarios.', 'María González', '/diverse-students-studying.png', ARRAY['React', 'Node.js', 'MongoDB'], 45, '/placeholder.svg', true),
('App de Realidad Aumentada', 'Aplicación móvil que utiliza AR para visualizar modelos 3D de anatomía humana con fines educativos.', 'Carlos Ramírez', '/developer-working.png', ARRAY['Unity', 'C#', 'ARCore'], 67, '/placeholder.svg', true),
('Chatbot con IA', 'Asistente virtual inteligente para responder preguntas frecuentes de estudiantes sobre trámites universitarios.', 'Ana Martínez', '/female-student.jpg', ARRAY['Python', 'TensorFlow', 'NLP'], 89, '/placeholder.svg', true),
('E-commerce Sostenible', 'Marketplace para productos ecológicos con sistema de puntos por compras sustentables.', 'Luis Torres', '/male-student.jpg', ARRAY['Next.js', 'Stripe', 'PostgreSQL'], 52, '/placeholder.svg', false),
('Plataforma de Tutorías', 'Sistema de conexión entre estudiantes y tutores con videollamadas integradas y calendario compartido.', 'Sofia Hernández', '/tutor-session.png', ARRAY['Vue.js', 'WebRTC', 'Firebase'], 73, '/placeholder.svg', true),
('Juego Educativo de Matemáticas', 'Juego interactivo para aprender álgebra y geometría de forma divertida con niveles progresivos.', 'Diego Vargas', '/game-developer.jpg', ARRAY['Phaser', 'JavaScript', 'Canvas'], 41, '/placeholder.svg', false),
('Red Social Universitaria', 'Plataforma social exclusiva para estudiantes con grupos de estudio, eventos y foros de discusión.', 'Valentina Ruiz', '/social-media-user.jpg', ARRAY['React Native', 'GraphQL', 'AWS'], 95, '/placeholder.svg', true),
('Sistema de Biblioteca Digital', 'Repositorio digital con búsqueda avanzada, préstamos virtuales y recomendaciones personalizadas.', 'Roberto Sánchez', '/librarian.png', ARRAY['Django', 'Elasticsearch', 'Docker'], 58, '/placeholder.svg', false),
('App de Salud Mental', 'Aplicación para el bienestar estudiantil con meditaciones guiadas, seguimiento de ánimo y recursos de apoyo.', 'Camila López', '/wellness-coach.jpg', ARRAY['Flutter', 'Dart', 'Supabase'], 82, '/placeholder.svg', true),
('Simulador de Física', 'Herramienta interactiva para simular experimentos de física con visualizaciones en tiempo real.', 'Andrés Morales', '/physics-student.jpg', ARRAY['Three.js', 'WebGL', 'TypeScript'], 64, '/placeholder.svg', false)
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Projects are viewable by everyone" ON projects
    FOR SELECT USING (status = 'published');

-- Política para administradores (requiere autenticación)
CREATE POLICY "Admins can do everything" ON projects
    FOR ALL USING (auth.role() = 'service_role');

-- Crear función para búsqueda de texto completo
CREATE OR REPLACE FUNCTION search_projects(search_term TEXT)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(255),
    description TEXT,
    author VARCHAR(255),
    author_avatar VARCHAR(500),
    tags TEXT[],
    stars INTEGER,
    image VARCHAR(500),
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    featured BOOLEAN,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.*,
        ts_rank(
            to_tsvector('spanish', p.title || ' ' || p.description || ' ' || p.author || ' ' || array_to_string(p.tags, ' ')),
            plainto_tsquery('spanish', search_term)
        ) as rank
    FROM projects p
    WHERE 
        p.status = 'published' AND
        (
            to_tsvector('spanish', p.title || ' ' || p.description || ' ' || p.author || ' ' || array_to_string(p.tags, ' '))
            @@ plainto_tsquery('spanish', search_term)
        )
    ORDER BY rank DESC, p.stars DESC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
--  Tablas auxiliares que usa tu código
--  (NO cambian tu tabla "projects")
-- =========================================

-- Vistas por proyecto (para lib/project-views.ts)
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

-- Comentarios por proyecto (para /api/projects/[id]/comments)
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
--  RLS (si vas a usar anon key desde el cliente)
--  El service role del servidor IGNORA RLS.
-- =========================================
alter table public.project_views    enable row level security;
alter table public.project_comments enable row level security;

-- Leer comentarios (público)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_comments' and policyname='read comments'
  ) then
    create policy "read comments" on public.project_comments
      for select using (true);
  end if;
end $$;

-- Insertar comentarios (público; ajusta si quieres exigir login)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_comments' and policyname='insert comments'
  ) then
    create policy "insert comments" on public.project_comments
      for insert with check (true);
  end if;
end $$;

-- Insertar vistas (tracking)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_views' and policyname='insert views'
  ) then
    create policy "insert views" on public.project_views
      for insert with check (true);
  end if;
end $$;

-- (Opcional) Leer project_views desde cliente:
-- do $$ begin
--   if not exists (
--     select 1 from pg_policies
--     where schemaname='public' and tablename='project_views' and policyname='read views'
--   ) then
--     create policy "read views" on public.project_views
--       for select using (true);
--   end if;
-- end $$;

-- =========================================
--  Forzar recarga del schema cache (evita PGRST205)
-- =========================================
notify pgrst, 'reload schema';