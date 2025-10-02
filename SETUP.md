# 🚀 Guía de Configuración - UniProjects

Esta guía te ayudará a configurar completamente el proyecto UniProjects con todas las funcionalidades implementadas.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase configurada
- Editor de código (VS Code recomendado)

## 🔧 Configuración Paso a Paso

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Supabase (YA PROPORCIONADAS)
SUPABASE_URL="https://gpqmuewqlnnqpeirqcng.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://gpqmuewqlnnqpeirqcng.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcW11ZXdxbG5ucXBlaXJxY25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTQ2NzgsImV4cCI6MjA3NDkzMDY3OH0.XcD1zilUZfWmzJEiowThwm9QJJ5tTiQ-x2G2TCHvKAA"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcW11ZXdxbG5ucXBlaXJxY25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM1NDY3OCwiZXhwIjoyMDc0OTMwNjc4fQ.AtLSYltbbqahM_w3-qeE2wT8K_yBgoLybelBqpb7_bg"

# Token temporal para panel admin (CAMBIAR EN PRODUCCIÓN)
ADMIN_TOKEN="admin-desarrollo-token"

# Configuración de seguridad (CAMBIAR EN PRODUCCIÓN)
NEXTAUTH_SECRET="tu-nextauth-secret-muy-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Configuración de Base de Datos

1. Ve a tu panel de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a SQL Editor
4. Ejecuta el contenido del archivo `lib/database.sql`

Esto creará:
- ✅ Tabla `projects` con todos los campos necesarios
- ✅ Índices para optimización
- ✅ Row Level Security (RLS)
- ✅ Función de búsqueda de texto completo
- ✅ Datos de ejemplo

### 3. Instalación de Dependencias

```bash
npm install
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en: http://localhost:3000

## 🎯 Funcionalidades Implementadas

### ✅ Backend Completo
- **API Routes**: CRUD completo para proyectos
- **Supabase Integration**: Cliente configurado con tipos TypeScript
- **Autenticación**: Middleware de seguridad para panel admin
- **Validación**: Validación de datos en todas las rutas

### ✅ Frontend Interactivo
- **Búsqueda en Tiempo Real**: Con debounce para optimización
- **Filtros Dinámicos**: Por proyectos destacados
- **Sistema de Likes**: Funcional con actualización en tiempo real
- **Estados de Carga**: Indicadores visuales y manejo de errores
- **Responsive Design**: Adaptado para móviles y desktop

### ✅ Panel de Administración
- **Dashboard**: Estadísticas y métricas
- **CRUD Completo**: Crear, editar, eliminar proyectos
- **Gestión de Estados**: Borrador, publicado, archivado
- **Búsqueda y Filtros**: Para administrar proyectos
- **Autenticación**: Protegido con middleware

### ✅ Logos y Branding
- **Header Logo**: `unilog.png` en la navegación
- **Favicon**: `logitoutp.png` en el head
- **Configuración Centralizada**: En `lib/config.ts`

## 🔐 Acceso al Panel de Administración

### Desarrollo
1. Ve a: http://localhost:3000/admin
2. En las herramientas de desarrollador (F12), ve a Console
3. Ejecuta: `localStorage.setItem('admin_token', 'admin-desarrollo-token')`
4. Recarga la página

### Producción (Recomendado)
Implementar Auth0 siguiendo la documentación en `lib/auth-middleware.ts`

## 📁 Estructura de Archivos Importantes

```
hackaton-unix/
├── app/
│   ├── api/projects/          # API Routes para CRUD
│   ├── admin/                 # Panel de administración
│   └── layout.tsx             # Layout principal con logos
├── components/
│   ├── project-grid-dynamic.tsx  # Grid interactivo
│   ├── project-card.tsx          # Tarjetas de proyectos
│   └── ui/                       # Componentes UI reutilizables
├── lib/
│   ├── config.ts              # Configuración centralizada
│   ├── supabase.ts            # Cliente Supabase
│   ├── auth-middleware.ts     # Autenticación
│   ├── database.sql           # Esquema de base de datos
│   └── hooks/                 # Hooks personalizados
└── public/
    ├── unilog.png            # Logo del header
    └── logitoutp.png         # Logo del favicon
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Auditoría de seguridad
npm audit
```

## 🔧 Configuración Adicional Recomendada

### Para Producción:
1. **Auth0**: Configurar autenticación real
2. **Variables de Entorno**: Cambiar todos los secretos
3. **HTTPS**: Configurar certificados SSL
4. **CDN**: Para imágenes y assets estáticos
5. **Monitoring**: Logs y métricas de rendimiento

### Para Desarrollo:
1. **ESLint**: Configuración de linting
2. **Prettier**: Formateo de código
3. **Husky**: Git hooks para calidad de código
4. **TypeScript**: Configuración estricta

## 🚨 Notas de Seguridad

⚠️ **IMPORTANTE**: En producción, asegúrate de:
- Cambiar todos los tokens y secretos
- Configurar Auth0 o similar para autenticación real
- Habilitar HTTPS
- Configurar CORS apropiadamente
- Revisar permisos de Supabase RLS

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica que las variables de entorno estén configuradas
3. Asegúrate de que Supabase esté funcionando
4. Revisa la documentación de cada componente

¡Listo! Tu aplicación UniProjects está completamente configurada y funcional. 🎉
