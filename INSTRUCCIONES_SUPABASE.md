# 🔧 INSTRUCCIONES URGENTES - Configurar Base de Datos

## ❗ ERROR ACTUAL
El error `Could not find the table 'public.projects'` indica que la tabla no existe en Supabase.

## 🚀 SOLUCIÓN RÁPIDA

### 1. Ve a tu panel de Supabase:
- Abre: https://supabase.com/dashboard
- Selecciona tu proyecto: `gpqmuewqlnnqpeirqcng`

### 2. Crear la tabla:
- Ve a **SQL Editor** en el menú lateral
- Copia y pega este código SQL:

```sql
-- Crear tabla de proyectos
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500) DEFAULT '/placeholder.svg',
  tags TEXT[] DEFAULT '{}',
  stars INTEGER DEFAULT 0,
  image VARCHAR(500) DEFAULT '/placeholder.svg',
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_stars ON public.projects(stars DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo
INSERT INTO public.projects (title, description, author, author_avatar, tags, stars, image, featured) VALUES
('Sistema de Gestión Académica', 'Plataforma web completa para gestionar calificaciones, asistencias y horarios de estudiantes universitarios.', 'María González', '/placeholder.svg', ARRAY['React', 'Node.js', 'MongoDB'], 45, '/placeholder.svg', true),
('App de Realidad Aumentada', 'Aplicación móvil que utiliza AR para visualizar modelos 3D de anatomía humana con fines educativos.', 'Carlos Ramírez', '/placeholder.svg', ARRAY['Unity', 'C#', 'ARCore'], 67, '/placeholder.svg', true),
('Chatbot con IA', 'Asistente virtual inteligente para responder preguntas frecuentes de estudiantes sobre trámites universitarios.', 'Ana Martínez', '/placeholder.svg', ARRAY['Python', 'TensorFlow', 'NLP'], 89, '/placeholder.svg', true),
('E-commerce Sostenible', 'Marketplace para productos ecológicos con sistema de puntos por compras sustentables.', 'Luis Torres', '/placeholder.svg', ARRAY['Next.js', 'Stripe', 'PostgreSQL'], 52, '/placeholder.svg', false),
('Plataforma de Tutorías', 'Sistema de conexión entre estudiantes y tutores con videollamadas integradas y calendario compartido.', 'Sofia Hernández', '/placeholder.svg', ARRAY['Vue.js', 'WebRTC', 'Firebase'], 73, '/placeholder.svg', true),
('Juego Educativo de Matemáticas', 'Juego interactivo para aprender álgebra y geometría de forma divertida con niveles progresivos.', 'Diego Vargas', '/placeholder.svg', ARRAY['Phaser', 'JavaScript', 'Canvas'], 41, '/placeholder.svg', false),
('Red Social Universitaria', 'Plataforma social exclusiva para estudiantes con grupos de estudio, eventos y foros de discusión.', 'Valentina Ruiz', '/placeholder.svg', ARRAY['React Native', 'GraphQL', 'AWS'], 95, '/placeholder.svg', true),
('Sistema de Biblioteca Digital', 'Repositorio digital con búsqueda avanzada, préstamos virtuales y recomendaciones personalizadas.', 'Roberto Sánchez', '/placeholder.svg', ARRAY['Django', 'Elasticsearch', 'Docker'], 58, '/placeholder.svg', false)
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (RLS) pero permitir lectura pública
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (TODOS pueden ver proyectos publicados)
CREATE POLICY "Anyone can view published projects" ON public.projects
    FOR SELECT USING (status = 'published');

-- Política para que cualquiera pueda insertar proyectos (para formulario público)
CREATE POLICY "Anyone can insert projects" ON public.projects
    FOR INSERT WITH CHECK (true);

-- Política para administradores (pueden hacer todo)
CREATE POLICY "Admins can do everything" ON public.projects
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
    );
```

### 3. Ejecutar el SQL:
- Haz clic en **RUN** o presiona `Ctrl+Enter`
- Deberías ver "Success. No rows returned"

### 4. Verificar:
- Ve a **Table Editor** en el menú lateral
- Deberías ver la tabla `projects` con datos de ejemplo

¡Después de esto, la aplicación funcionará correctamente! 🎉
