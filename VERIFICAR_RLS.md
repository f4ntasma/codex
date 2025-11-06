# 🔒 Verificar Políticas RLS en Supabase

## ⚠️ IMPORTANTE: Las políticas RLS deben estar aplicadas

Para que la seguridad funcione correctamente, necesitas ejecutar el script SQL que actualiza las políticas RLS.

## 📋 Pasos para Aplicar Seguridad

### 1. Ejecutar Script SQL de Políticas RLS

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `codex/lib/update-rls-policies.sql`
5. Ejecuta el script

### 2. Verificar que las Políticas Están Aplicadas

Ejecuta este SQL para verificar:

```sql
-- Ver todas las políticas de la tabla projects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;
```

Deberías ver:
- ✅ `Authenticated users can view published projects` (SELECT)
- ✅ `Authenticated users can insert projects` (INSERT)
- ✅ `Admins can update projects` (UPDATE)
- ✅ `Admins can delete projects` (DELETE)

### 3. Verificar que RLS está Habilitado

```sql
-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'projects'
AND schemaname = 'public';
```

El campo `rowsecurity` debe ser `true`.

### 4. Si RLS no está Habilitado

Ejecuta:

```sql
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
```

## 🔍 Probar la Seguridad

### Prueba 1: Sin Autenticación
1. Abre la aplicación en modo incógnito
2. Intenta acceder a `/`
3. Deberías ser redirigido a `/login`
4. Sin login, no deberías poder ver proyectos

### Prueba 2: Con Autenticación
1. Inicia sesión con `student@test.edu` / `Test123456`
2. Deberías poder ver la página principal
3. Deberías poder ver proyectos publicados

### Prueba 3: Directamente desde Supabase
1. Ve a Supabase Dashboard > Table Editor > projects
2. Intenta hacer una consulta sin autenticación
3. Debería fallar o no mostrar datos (dependiendo de las políticas)

## 🐛 Solución de Problemas

### Si aún puedes ver proyectos sin login:

1. **Verifica que el script SQL se ejecutó correctamente**
   - Revisa que no haya errores en el SQL Editor

2. **Verifica que RLS está habilitado**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'projects';
   ```

3. **Verifica que las políticas están creadas**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'projects';
   ```

4. **Si todo está bien, puede ser caché**
   - Limpia las cookies del navegador
   - Recarga la página
   - Prueba en modo incógnito

### Si la sesión se cierra automáticamente:

1. **Verifica las variables de entorno**
   - `NEXT_PUBLIC_SUPABASE_URL` debe estar configurada
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` debe estar configurada

2. **Verifica en la consola del navegador**
   - Abre DevTools > Console
   - Busca errores relacionados con Supabase

3. **Verifica las cookies**
   - DevTools > Application > Cookies
   - Deberías ver cookies con nombre `sb-<project-ref>-auth-token`

## 📝 Nota sobre supabaseAdmin

El código usa `supabaseAdmin` en algunas partes (como crear proyectos), lo cual bypassa RLS. Esto es intencional para operaciones administrativas, pero las consultas normales (GET) ahora usan el cliente con el token del usuario para respetar RLS.

