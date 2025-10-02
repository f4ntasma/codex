// Configuración centralizada de la aplicación
// Este archivo maneja todas las variables de entorno y configuraciones

// Configuración de Supabase - Base de datos y autenticación
// Usa las variables de entorno si están disponibles, sino usa las credenciales proporcionadas
export const supabaseConfig = {
  // URL de tu proyecto Supabase
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://gpqmuewqlnnqpeirqcng.supabase.co",
  
  // Clave anónima para operaciones públicas (lectura de proyectos)
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcW11ZXdxbG5ucXBlaXJxY25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTQ2NzgsImV4cCI6MjA3NDkzMDY3OH0.XcD1zilUZfWmzJEiowThwm9QJJ5tTiQ-x2G2TCHvKAA",
  
  // Clave de servicio para operaciones administrativas (CRUD completo)
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcW11ZXdxbG5ucXBlaXJxY25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM1NDY3OCwiZXhwIjoyMDc0OTMwNjc4fQ.AtLSYltbbqahM_w3-qeE2wT8K_yBgoLybelBqpb7_bg"
}

// Configuración de Auth0 - Autenticación para panel admin
export const auth0Config = {
  secret: process.env.AUTH0_SECRET || "desarrollo-secreto-cambiar-en-produccion",
  baseUrl: process.env.AUTH0_BASE_URL || "http://localhost:3000",
  issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL || "https://tu-dominio.auth0.com",
  clientId: process.env.AUTH0_CLIENT_ID || "tu-client-id",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "tu-client-secret"
}

// Configuración de seguridad - Tokens y claves de encriptación
export const securityConfig = {
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "desarrollo-nextauth-secret",
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  adminToken: process.env.ADMIN_TOKEN || "admin-desarrollo-token"
}

// Configuración de la aplicación - Metadatos y configuraciones generales
export const appConfig = {
  name: "UniProjects",
  description: "Plataforma de proyectos estudiantiles universitarios",
  version: "1.0.0",
  author: "Hackaton Unix Team",
  // URLs de logos
  logos: {
    header: "/unilog.png", // Logo para el header/navegación
    favicon: "/logitoutp.png", // Logo para el favicon/head
    placeholder: "/placeholder.svg" // Imagen placeholder por defecto
  },
  // Configuración de paginación
  pagination: {
    defaultLimit: 24, // Número de proyectos por página por defecto
    maxLimit: 100 // Límite máximo de proyectos por consulta
  },
  // Estados de proyectos permitidos
  projectStatuses: ['draft', 'published', 'archived'] as const,
  // Configuración de búsqueda
  search: {
    minLength: 2, // Longitud mínima para búsqueda
    debounceMs: 300 // Tiempo de espera para búsqueda en tiempo real
  }
}

// Validación de configuración - Verifica que las variables críticas estén presentes
export function validateConfig() {
  const errors: string[] = []
  
  if (!supabaseConfig.url) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL es requerida")
  }
  
  if (!supabaseConfig.anonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida")
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (securityConfig.nextAuthSecret === "desarrollo-nextauth-secret") {
      errors.push("NEXTAUTH_SECRET debe ser cambiado en producción")
    }
    
    if (auth0Config.secret === "desarrollo-secreto-cambiar-en-produccion") {
      errors.push("AUTH0_SECRET debe ser configurado en producción")
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Función para obtener la URL base de la aplicación
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL actual
    return window.location.origin
  }
  
  // En el servidor, usar variables de entorno o valores por defecto
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return process.env.NEXTAUTH_URL || "http://localhost:3000"
}
