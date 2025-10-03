import { supabaseAdmin } from './supabase'

export interface ProjectView {
  id: number
  project_id: number
  user_id: string
  user_name: string
  user_role: string
  viewed_at: string
  user_avatar?: string
}

export interface ProjectViewStats {
  total_views: number
  unique_viewers: number
  views_by_role: {
    student: number
    corporate: number
    admin: number
  }
  recent_viewers: ProjectView[]
}

export async function trackProjectView(projectId: number, userId: string, userName: string, userRole: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_views')
      .insert({
        project_id: projectId,
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        viewed_at: new Date().toISOString()
      })
      .select()
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

export async function getProjectViews(projectId: number): Promise<ProjectViewStats | null> {
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

    const views = data || []
    const uniqueViewers = new Set(views.map(view => view.user_id)).size
    
    const viewsByRole = views.reduce((acc, view) => {
      acc[view.user_role] = (acc[view.user_role] || 0) + 1
      return acc
    }, { student: 0, corporate: 0, admin: 0 })

    return {
      total_views: views.length,
      unique_viewers: uniqueViewers,
      views_by_role: viewsByRole,
      recent_viewers: views.slice(0, 10) // Últimos 10 viewers
    }
  } catch (error) {
    console.error('Error fetching project views:', error)
    return null
  }
}

export async function getUserViewedProjects(userId: string): Promise<ProjectView[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_views')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user viewed projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user viewed projects:', error)
    return []
  }
}
