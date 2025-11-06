import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'
import { getAuthenticatedUser, createSupabaseServerClient } from '@/lib/supabase-server'
import { appConfig } from '@/lib/config'
import type { ProjectInsert } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET - Obtener todos los proyectos (requiere autenticación)
export async function GET(request: NextRequest) {
  // Verificar autenticación usando Supabase
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado. Debes iniciar sesión para ver los proyectos.' },
      { status: 401 }
    )
  }

  try {
    // Usar el cliente con el token del usuario para respetar RLS
    const supabase = createSupabaseServerClient(request)
    
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'published'

    // Si hay un término de búsqueda, usar la función de búsqueda de texto completo
    if (search && search.length >= 2) {
      let query = supabase
        .rpc('search_projects', { search_term: search })
        .order('stars', { ascending: false })

      if (limit) {
        const limitNum = Math.min(parseInt(limit), appConfig.pagination.maxLimit)
        query = query.limit(limitNum)
      }

      const { data, error } = await query
      if (error) throw error
      
      return NextResponse.json({
        projects: data,
        count: data?.length || 0,
        hasMore: data?.length === parseInt(limit || '0'),
        timestamp: new Date().toISOString()
      })
    }

    // --- Consulta normal si no hay búsqueda ---
    let query = supabase.from('projects').select('*').order('stars', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)
    if (featured === 'true') query = query.eq('featured', true)

    // Aplicar límite con validación
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

    // Agregar metadatos útiles a la respuesta
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

// POST - Crear nuevo proyecto (requiere autenticación)
export async function POST(request: NextRequest) {
  // Verificar autenticación usando Supabase
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado. Debes iniciar sesión para subir proyectos.' },
      { status: 401 }
    )
  }

  try {

    const body = await request.json()
    
    // Validar datos requeridos
    if (!body.title || !body.description || !body.author) {
      return NextResponse.json(
        { 
          error: 'Datos requeridos faltantes',
          required: ['title', 'description', 'author']
        },
        { status: 400 }
      )
    }

    // Preparar datos del proyecto con valores por defecto
    // Los proyectos públicos siempre empiezan como 'published' y no destacados
    const projectData: ProjectInsert = {
      title: body.title.trim(),
      description: body.description.trim(),
      author: body.author.trim(),
      author_avatar: body.author_avatar || appConfig.logos.placeholder,
      tags: Array.isArray(body.tags) ? body.tags : [],
      stars: 0, // Los proyectos nuevos empiezan con 0 stars
      image: body.image || appConfig.logos.placeholder,
      github_url: body.github_url || null,
      demo_url: body.demo_url || null,
      featured: false, // Solo los admins pueden marcar como destacado
      status: 'published' // Los proyectos públicos se publican automáticamente
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

    // Log de auditoría para proyectos públicos
    console.log(`Proyecto público creado por: ${data.author} - ${data.title}`)

    return NextResponse.json({
      project: data,
      message: 'Proyecto subido exitosamente. ¡Gracias por compartir tu trabajo!',
      timestamp: new Date().toISOString()
    }, { status: 201 })
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
