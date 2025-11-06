# 👥 Crear Usuarios de Prueba

## Método 1: Script Automático (Recomendado)

### Ejecutar el script:

```bash
# Desde la raíz del proyecto
node scripts/create-test-users.js
```

O si prefieres usar npm:

```bash
npm run create-users
```

### Usuarios que se crearán:

1. **Estudiante (Student)**
   - Email: `student@test.edu`
   - Password: `Test123456`
   - Rol: `student`

2. **Corporativo (Corporate)**
   - Email: `corporate@intercorp.com`
   - Password: `Test123456`
   - Rol: `corporate`

3. **Administrador (Admin)**
   - Email: `admin@test.edu`
   - Password: `Test123456`
   - Rol: `admin`

## Método 2: Crear Manualmente desde Supabase Dashboard

### Paso 1: Crear Usuario Student

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Users**
4. Haz clic en **"Add User"** > **"Create New User"**
5. Completa:
   - **Email**: `student@test.edu`
   - **Password**: `Test123456`
   - **Auto Confirm User**: ✅ (marcar)
6. Haz clic en **"Create User"**
7. El perfil se creará automáticamente con rol `student` (por el trigger)

### Paso 2: Crear Usuario Corporate

1. Repite los pasos anteriores con:
   - **Email**: `corporate@intercorp.com`
   - **Password**: `Test123456`
   - El rol será `corporate` automáticamente

### Paso 3: Crear Usuario Admin

1. Crea el usuario con:
   - **Email**: `admin@test.edu`
   - **Password**: `Test123456`
2. Luego ejecuta este SQL en el **SQL Editor**:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@test.edu';
```

## Método 3: Crear desde SQL (Solo si ya tienes usuarios en auth.users)

Si ya tienes usuarios creados en Supabase Auth y solo quieres crear/actualizar los perfiles:

```sql
-- Obtener el ID del usuario (reemplaza 'student@test.edu' con el email real)
-- Luego ejecuta:

INSERT INTO public.profiles (id, email, name, role)
VALUES (
  'UUID_DEL_USUARIO',  -- Reemplaza con el ID real de auth.users
  'student@test.edu',
  'Estudiante Test',
  'student'
)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
```

## ✅ Verificar Usuarios Creados

Ejecuta este SQL para ver todos los usuarios:

```sql
SELECT 
  p.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.role, p.created_at;
```

## 🔐 Iniciar Sesión

Una vez creados los usuarios, puedes iniciar sesión en:

- URL: `http://localhost:3000/login` (o tu URL de producción)
- Usa cualquiera de los emails y contraseñas de arriba

## ⚠️ Notas Importantes

- **Las contraseñas deben cumplir con los requisitos de Supabase** (mínimo 6 caracteres)
- **Los emails deben ser únicos** en Supabase
- **El trigger automático** asigna roles basado en el dominio del email:
  - `.edu` → `student`
  - Dominios corporativos → `corporate`
  - Para `admin` necesitas actualizarlo manualmente

## 🐛 Solución de Problemas

### Si el script falla:

1. Verifica que tengas las variables de entorno en `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   SUPABASE_SERVICE_ROLE_KEY=tu_key
   ```

2. Verifica que el `SUPABASE_SERVICE_ROLE_KEY` sea correcto (no el anon key)

3. Si los usuarios ya existen, el script intentará actualizarlos automáticamente

### Si el perfil no se crea automáticamente:

Ejecuta este SQL para crear el perfil manualmente:

```sql
-- Primero obtén el ID del usuario desde auth.users
-- Ve a Authentication > Users y copia el UUID

-- Luego ejecuta:
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  'UUID_AQUI',  -- Reemplaza con el UUID real
  'email@ejemplo.com',
  'Nombre del Usuario',
  'student'  -- o 'corporate' o 'admin'
);
```

