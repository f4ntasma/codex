# Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# =========================================
#  SUPABASE CONFIGURATION
# =========================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio-aqui

# =========================================
#  AUTHENTICATION
# =========================================
JWT_SECRET=tu-secreto-jwt-muy-seguro-aqui
NEXTAUTH_SECRET=tu-secreto-nextauth-muy-seguro-aqui
NEXTAUTH_URL=http://localhost:3000

# =========================================
#  ADMIN CONFIGURATION
# =========================================
ADMIN_TOKEN=tu-token-admin-seguro-aqui

# =========================================
#  ENVIRONMENT
# =========================================
NODE_ENV=development
```

## Notas Importantes:

1. **NUNCA** commitees el archivo `.env.local` al repositorio
2. Cambia **TODOS** los secretos en producción
3. Usa contraseñas seguras y únicas
4. Mantén las claves de servicio privadas
5. Configura las URLs correctas para tu entorno
