# 🔒 Guía para Aplicar Seguridad Completa

## ✅ Cambios Realizados en el Código

### 1. Página Principal Protegida
- ✅ La página principal (`app/page.tsx`) ahora requiere autenticación
- ✅ Se agregó `AuthGuard` que redirige a `/login` si no hay sesión

### 2. API de Proyectos Protegida
- ✅ La ruta GET `/api/projects` ahora requiere autenticación
- ✅ La ruta POST `/api/projects` ahora requiere autenticación
- ✅ Retorna error 401 si el usuario no está autenticado

## 🔐 Actualizar Políticas RLS en Supabase

Para completar la seguridad, necesitas ejecutar el script SQL en Supabase:

### Pasos:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `codex/lib/update-rls-policies.sql`
4. Ejecuta el script

### ¿Qué hace el script?

- ❌ **Elimina** la política pública que permitía ver proyectos sin autenticación
- ✅ **Crea** una nueva política que solo permite ver proyectos a usuarios autenticados
- ✅ **Protege** las operaciones de INSERT, UPDATE y DELETE

## ⚠️ Nota Importante

Actualmente, la API usa `supabaseAdmin` que bypassa las políticas RLS. Esto significa que:
- ✅ La autenticación se verifica en el código de la API
- ⚠️ Las políticas RLS son una capa adicional de seguridad

Para máxima seguridad, deberías:
1. Obtener el token de Supabase del usuario autenticado
2. Usar el cliente normal de Supabase (no admin) con ese token
3. Así las políticas RLS se aplicarán automáticamente

## 🧪 Cómo Verificar que Funciona

1. **Sin autenticación:**
   - Abre la aplicación en modo incógnito
   - Deberías ser redirigido a `/login`
   - No deberías poder ver proyectos

2. **Con autenticación:**
   - Inicia sesión
   - Deberías poder ver todos los proyectos publicados
   - Deberías poder subir nuevos proyectos

## 📝 Políticas RLS Actuales

Después de ejecutar el script:

- **SELECT**: Solo usuarios autenticados pueden ver proyectos con `status = 'published'`
- **INSERT**: Solo usuarios autenticados pueden crear proyectos
- **UPDATE**: Solo admins pueden actualizar proyectos
- **DELETE**: Solo admins pueden eliminar proyectos

