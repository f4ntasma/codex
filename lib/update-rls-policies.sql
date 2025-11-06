-- =========================================
--  ACTUALIZAR POLÍTICAS RLS PARA SEGURIDAD
-- =========================================
-- Este script actualiza las políticas RLS para requerir autenticación

-- =========================================
--  Eliminar política pública de lectura
-- =========================================
drop policy if exists "Projects are viewable by everyone" on public.projects;

-- =========================================
--  Nueva política: Solo usuarios autenticados pueden ver proyectos
-- =========================================
create policy "Authenticated users can view published projects" on public.projects
  for select 
  using (
    auth.uid() is not null 
    and status = 'published'
  );

-- =========================================
--  Policy para que los usuarios autenticados puedan insertar sus propios proyectos
-- =========================================
create policy "Authenticated users can insert projects" on public.projects
  for insert 
  with check (auth.uid() is not null);

-- =========================================
--  Policy para que los usuarios puedan actualizar sus propios proyectos
-- =========================================
-- Nota: Esto asume que hay un campo author_id en projects, si no, solo admins pueden actualizar
-- Por ahora, solo admins pueden actualizar
create policy "Admins can update projects" on public.projects
  for update 
  using (auth.role() = 'service_role');

-- =========================================
--  Policy para que solo admins puedan eliminar proyectos
-- =========================================
create policy "Admins can delete projects" on public.projects
  for delete 
  using (auth.role() = 'service_role');

