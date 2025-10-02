import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

// Cliente para uso público (frontend) - Permite operaciones de lectura y autenticación básica
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Cliente con privilegios de servicio (backend/API routes) - Permite todas las operaciones CRUD
export const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
  auth: {
    autoRefreshToken: false, // No refrescar tokens automáticamente en el servidor
    persistSession: false   // No persistir sesiones en el servidor
  }
})

// Tipos para TypeScript
export interface Project {
  id: number
  title: string
  description: string
  author: string
  author_avatar: string
  tags: string[]
  stars: number
  image: string
  github_url?: string
  demo_url?: string
  created_at: string
  updated_at: string
  featured: boolean
  status: 'draft' | 'published' | 'archived'
}

export interface ProjectInsert {
  title: string
  description: string
  author: string
  author_avatar: string
  tags: string[]
  stars?: number
  image: string
  github_url?: string
  demo_url?: string
  featured?: boolean
  status?: 'draft' | 'published' | 'archived'
}

export interface ProjectUpdate {
  title?: string
  description?: string
  author?: string
  author_avatar?: string
  tags?: string[]
  stars?: number
  image?: string
  github_url?: string
  demo_url?: string
  featured?: boolean
  status?: 'draft' | 'published' | 'archived'
}
