-- EJECUTAR ESTE SQL EN SUPABASE PARA SOLUCIONAR EL ERROR
-- Crear tabla de proyectos
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  stars INTEGER DEFAULT 0,
  image VARCHAR(500),
  featured BOOLEAN DEFAULT false,
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para probar
INSERT INTO public.projects (title, description, author, author_avatar, tags, stars, image, featured, github_url, demo_url) VALUES 
('Proyecto de Ejemplo 1', 'Una descripción detallada del proyecto que muestra las capacidades del desarrollador.', 'Juan Pérez', '/placeholder-user.jpg', ARRAY['React', 'Node.js', 'TypeScript'], 15, '/placeholder.svg', true, 'https://github.com/juanperez/proyecto1', 'https://proyecto1.demo.com'),
('Proyecto de Ejemplo 2', 'Otro proyecto interesante que demuestra habilidades en desarrollo web.', 'María García', '/placeholder-user.jpg', ARRAY['Vue.js', 'Python', 'PostgreSQL'], 8, '/placeholder.svg', false, 'https://github.com/mariagarcia/proyecto2', 'https://proyecto2.demo.com'),
('Proyecto de Ejemplo 3', 'Un proyecto más complejo que incluye múltiples tecnologías.', 'Carlos López', '/placeholder-user.jpg', ARRAY['Angular', 'Java', 'MongoDB'], 23, '/placeholder.svg', true, 'https://github.com/carloslopez/proyecto3', 'https://proyecto3.demo.com');

-- Habilitar Row Level Security pero permitir acceso completo por ahora
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Política que permite todo a todos (sin restricciones)
CREATE POLICY "Allow all operations for everyone" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- Tabla de comentarios de proyectos
CREATE TABLE IF NOT EXISTS public.project_comments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para comentarios
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON public.project_comments(created_at);

-- Habilitar RLS para comentarios
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Política para comentarios
CREATE POLICY "Allow all operations for comments" ON public.project_comments FOR ALL USING (true) WITH CHECK (true);

-- Tabla de vistas de proyectos
CREATE TABLE IF NOT EXISTS public.project_views (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  user_role VARCHAR(50),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para vistas
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON public.project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_viewed_at ON public.project_views(viewed_at);

-- Habilitar RLS para vistas
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Política para vistas
CREATE POLICY "Allow all operations for views" ON public.project_views FOR ALL USING (true) WITH CHECK (true);
