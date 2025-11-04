# 🚀 Guía para Ejecutar SQL en Supabase

## 📋 Pasos para Ejecutar el Script SQL

### 1. Abre el Editor SQL en Supabase
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New Query"** (Nueva Consulta)

### 2. Copia y Pega el Script
1. Abre el archivo `codex/lib/complete-database-setup.sql`
2. Copia **TODO** el contenido (Ctrl+A, Ctrl+C)
3. Pégalo en el editor SQL de Supabase

### 3. Ejecuta el Script
1. Haz clic en el botón **"Run"** (Ejecutar) o presiona `Ctrl+Enter`
2. Espera a que termine la ejecución
3. Deberías ver mensajes de éxito para cada sección

### 4. Verifica que Todo Funcionó
1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ `projects`
   - ✅ `profiles`
   - ✅ `project_views`
   - ✅ `project_comments`

### 5. Verifica los Datos de Ejemplo
1. En la tabla `projects`, deberías ver 10 proyectos de ejemplo
2. Estos proyectos ya están listos para usar en tu aplicación

## ⚠️ Notas Importantes

- **El script es idempotente**: Puedes ejecutarlo múltiples veces sin problemas
- **No elimina datos existentes**: Si ya tienes datos, se mantendrán
- **Datos de ejemplo**: El script inserta 10 proyectos de ejemplo si no existen

## 🔐 Configurar tu Rol de Admin

Después de registrarte, ejecuta este SQL para convertirte en admin:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'tu-correo@ejemplo.com';
```

Reemplaza `'tu-correo@ejemplo.com'` con tu email real.

## ✅ Verificación Final

Ejecuta esta consulta para verificar que todo está bien:

```sql
-- Ver proyectos
SELECT COUNT(*) as total_projects FROM public.projects;

-- Ver estructura de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Ambas consultas deberían ejecutarse sin errores.

