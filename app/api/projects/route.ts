import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, createSupabaseServerClient } from '@/lib/supabase-server'
import { appConfig } from '@/lib/config'
import type { ProjectInsert } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET - Obtener todos los proyectos (requiere autenticación)
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado. Debes iniciar sesión para ver los proyectos.' },
      { status: 401 }
    )
  }

  try {
    const supabase = createSupabaseServerClient(request)
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'published'

    // Si hay búsqueda de texto completo
    if (search && search.length >= 2) {
      let searchQuery = supabase
        .rpc('search_projects', { search_term: search })
        .order('stars', { ascending: false })

      if (limit) {
        const limitNum = Math.min(parseInt(limit), appConfig.pagination.maxLimit)
        searchQuery = searchQuery.limit(limitNum)
      }

      const { data, error } = await searchQuery
      if (error) throw error

      return NextResponse.json({
        projects: data,
        count: data?.length || 0,
        hasMore: data?.length === parseInt(limit || '0'),
        timestamp: new Date().toISOString()
      })
    }

    // Consulta normal
    let query = supabase.from('projects').select('*').order('stars', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)
    if (featured === 'true') query = query.eq('featured', true)

    if (limit) {
      const limitNum = Math.min(parseInt(limit), appConfig.pagination.maxLimit)
      query = query.limit(limitNum)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { 
          error: 'Error al obtener proyectos',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      projects: data,
      count: data?.length || 0,
      hasMore: data?.length === parseInt(limit || '0'),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo proyecto (público, no requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.description || !body.author) {
      return NextResponse.json(
        { 
          error: 'Datos requeridos faltantes',
          required: ['title', 'description', 'author']
        },
        { status: 400 }
      )
    }

    const projectData: ProjectInsert = {
      title: body.title.trim(),
      description: body.description.trim(),
      author: body.author.trim(),
      author_avatar: body.author_avatar || appConfig.logos.placeholder,
      tags: Array.isArray(body.tags) ? body.tags : [],
      stars: 0,
      image: body.image || appConfig.logos.placeholder,
      github_url: body.github_url || null,
      demo_url: body.demo_url || null,
      featured: false,
      status: 'published'
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { 
          error: 'Error al crear proyecto',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Proyecto creado con éxito',
        project: data 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al crear proyecto',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}