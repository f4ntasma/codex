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
  featured BOOLEAN DEFAULT false,
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

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
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (status = 'published');

-- Política para inserción (cualquiera puede crear proyectos)
CREATE POLICY "Anyone can create projects" ON projects FOR INSERT WITH CHECK (true);

-- Política para actualización (cualquiera puede actualizar)
CREATE POLICY "Anyone can update projects" ON projects FOR UPDATE USING (true) WITH CHECK (true);

-- Política para eliminación (cualquiera puede eliminar)
CREATE POLICY "Anyone can delete projects" ON projects FOR DELETE USING (true);

-- Crear tabla de comentarios
CREATE TABLE IF NOT EXISTS project_comments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para comentarios
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at);

-- Habilitar RLS para comentarios
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Política para comentarios
CREATE POLICY "Comments are viewable by everyone" ON project_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON project_comments FOR INSERT WITH CHECK (true);

-- Crear tabla de vistas
CREATE TABLE IF NOT EXISTS project_views (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  user_role VARCHAR(50),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para vistas
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_viewed_at ON project_views(viewed_at);

-- Habilitar RLS para vistas
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Política para vistas
CREATE POLICY "Views are viewable by everyone" ON project_views FOR SELECT USING (true);
CREATE POLICY "Anyone can create views" ON project_views FOR INSERT WITH CHECK (true);
