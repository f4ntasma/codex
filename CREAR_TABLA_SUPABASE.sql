-- EJECUTAR ESTE SQL EN SUPABASE PARA SOLUCIONAR EL ERROR
-- Ve a: https://supabase.com/dashboard → Tu proyecto → SQL Editor → New query

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

-- Crear índices para mejor rendimiento
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

-- Insertar datos de ejemplo para probar
INSERT INTO public.projects (title, description, author, author_avatar, tags, stars, image, featured, github_url, demo_url) VALUES
('Sistema de Gestión Académica', 'Plataforma web completa para gestionar calificaciones, asistencias y horarios de estudiantes universitarios. Incluye módulos para profesores, estudiantes y administradores.', 'María González', '/placeholder.svg', ARRAY['React', 'Node.js', 'MongoDB'], 45, '/placeholder.svg', true, 'https://github.com/maria/gestion-academica', 'https://gestion-academica.vercel.app'),

('App de Realidad Aumentada', 'Aplicación móvil que utiliza AR para visualizar modelos 3D de anatomía humana con fines educativos. Perfecta para estudiantes de medicina.', 'Carlos Ramírez', '/placeholder.svg', ARRAY['Unity', 'C#', 'ARCore'], 67, '/placeholder.svg', true, 'https://github.com/carlos/ar-anatomy', 'https://ar-anatomy.com'),

('Chatbot con IA', 'Asistente virtual inteligente para responder preguntas frecuentes de estudiantes sobre trámites universitarios. Utiliza procesamiento de lenguaje natural.', 'Ana Martínez', '/placeholder.svg', ARRAY['Python', 'TensorFlow', 'NLP'], 89, '/placeholder.svg', true, 'https://github.com/ana/chatbot-ia', 'https://chatbot-universitario.com'),

('E-commerce Sostenible', 'Marketplace para productos ecológicos con sistema de puntos por compras sustentables. Incluye sistema de recompensas y gamificación.', 'Luis Torres', '/placeholder.svg', ARRAY['Next.js', 'Stripe', 'PostgreSQL'], 52, '/placeholder.svg', false, 'https://github.com/luis/ecommerce-verde', 'https://ecommerce-sostenible.com'),

('Plataforma de Tutorías', 'Sistema de conexión entre estudiantes y tutores con videollamadas integradas y calendario compartido. Incluye sistema de pagos.', 'Sofia Hernández', '/placeholder.svg', ARRAY['Vue.js', 'WebRTC', 'Firebase'], 73, '/placeholder.svg', true, 'https://github.com/sofia/tutorias', 'https://tutorias-online.com'),

('Juego Educativo de Matemáticas', 'Juego interactivo para aprender álgebra y geometría de forma divertida con niveles progresivos. Ideal para estudiantes de secundaria.', 'Diego Vargas', '/placeholder.svg', ARRAY['Phaser', 'JavaScript', 'Canvas'], 41, '/placeholder.svg', false, 'https://github.com/diego/math-game', 'https://math-adventure.com'),

('Red Social Universitaria', 'Plataforma social exclusiva para estudiantes con grupos de estudio, eventos y foros de discusión. Conecta estudiantes de toda la universidad.', 'Valentina Ruiz', '/placeholder.svg', ARRAY['React Native', 'GraphQL', 'AWS'], 95, '/placeholder.svg', true, 'https://github.com/valentina/red-social', 'https://unisocial.app'),

('Sistema de Biblioteca Digital', 'Repositorio digital con búsqueda avanzada, préstamos virtuales y recomendaciones personalizadas. Gestión completa de recursos académicos.', 'Roberto Sánchez', '/placeholder.svg', ARRAY['Django', 'Elasticsearch', 'Docker'], 58, '/placeholder.svg', false, 'https://github.com/roberto/biblioteca', 'https://biblioteca-digital.edu'),

('App de Salud Mental', 'Aplicación para el bienestar estudiantil con meditaciones guiadas, seguimiento de ánimo y recursos de apoyo. Enfocada en la salud mental universitaria.', 'Camila López', '/placeholder.svg', ARRAY['Flutter', 'Dart', 'Supabase'], 82, '/placeholder.svg', true, 'https://github.com/camila/salud-mental', 'https://bienestar-estudiantil.app'),

('Simulador de Física', 'Herramienta interactiva para simular experimentos de física con visualizaciones en tiempo real. Incluye laboratorios virtuales completos.', 'Andrés Morales', '/placeholder.svg', ARRAY['Three.js', 'WebGL', 'TypeScript'], 64, '/placeholder.svg', false, 'https://github.com/andres/simulador-fisica', 'https://fisica-virtual.com')

ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security pero permitir acceso completo por ahora
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Política que permite todo a todos (sin restricciones)
CREATE POLICY "Allow all operations for everyone" ON public.projects
    FOR ALL USING (true) WITH CHECK (true);

-- Mensaje de confirmación
SELECT 'Tabla projects creada exitosamente con ' || COUNT(*) || ' proyectos de ejemplo' as resultado
FROM public.projects;
