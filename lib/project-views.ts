// lib/project-views.ts
import { supabaseAdmin } from './supabase'

export interface ProjectView {
  id: number
  project_id: number
  user_id: string | null
  user_name: string | null
  user_role: 'student' | 'corporate' | 'admin'
  viewed_at: string
  user_avatar?: string | null
}

function isUUID(v: unknown): v is string {
  if (typeof v !== 'string') return false
  // UUID v1–v5 (simple regex)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

function normalizeRole(role: any): 'student' | 'corporate' | 'admin' {
  return role === 'corporate' || role === 'admin' ? role : 'student'
}

export async function trackProjectView(
  projectId: number,
  userId: unknown,
  userName: unknown,
  userRole: unknown
) {
  try {
    const payload = {
      project_id: projectId,
      user_id: isUUID(userId) ? userId : null,
      user_name: typeof userName === 'string' && userName.trim() ? userName.trim() : null,
      user_role: normalizeRole(userRole),
      viewed_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('project_views')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error('Error tracking project view:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Error tracking project view:', error)
    return null
  }
}

export async function getProjectViews(projectId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_views')
      .select('*')
      .eq('project_id', projectId)
      .order('viewed_at', { ascending: false })

    if (error) {
      console.error('Error fetching project views:', error)
      return null
    }

    const views = (data ?? []) as any[]
    const uniqueViewers = new Set(views.map(v => v.user_id).filter(Boolean)).size

    const viewsByRole = views.reduce<{ student: number; corporate: number; admin: number }>((acc, v) => {
      const r = normalizeRole(v?.user_role)
      acc[r] += 1
      return acc
    }, { student: 0, corporate: 0, admin: 0 })

    return {
      total_views: views.length,
      unique_viewers: uniqueViewers,
      views_by_role: viewsByRole,
      recent_viewers: views.slice(0, 10),
    }
  } catch (error) {
    console.error('Error fetching project views:', error)
    return null
  }
}