import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST -> Dar like a un proyecto (evita múltiples likes desde el mismo navegador)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Detectar usuario autenticado (opcional) y recordar likes en cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const { data: userData } = token ? await supabaseAdmin.auth.getUser(token) : { data: null }
    const userId = userData?.user?.id || null

    const likedCookie = request.cookies.get('liked_projects')?.value
    const likedSet = new Set<string>(likedCookie ? likedCookie.split(',').filter(Boolean) : [])
    const alreadyLiked = likedSet.has(params.id)

    if (alreadyLiked) {
      return NextResponse.json(
        { success: false, error: 'Ya diste like a este proyecto' },
        { status: 400 }
      )
    }

    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, stars, title')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Proyecto no encontrado' },
          { status: 404 }
        )
      }
      console.error('Error fetching project for like:', fetchError)
      return NextResponse.json(
        { error: 'Error al obtener proyecto' },
        { status: 500 }
      )
    }

    // Incrementar el contador de stars una sola vez
    const newStars = project.stars + 1

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ stars: newStars })
      .eq('id', params.id)
      .select('id, stars, title')
      .single()

    if (error) {
      console.error('Error updating likes:', error)
      return NextResponse.json(
        { error: 'Error al actualizar likes' },
        { status: 500 }
      )
    }

    console.log(`Like agregado al proyecto: ${data.title} (${data.stars} stars)`, userId ? `por ${userId}` : '')

    const response = NextResponse.json({
      success: true,
      project: data,
      message: '¡Gracias por tu like!',
      timestamp: new Date().toISOString()
    })

    likedSet.add(params.id)
    response.cookies.set('liked_projects', Array.from(likedSet).join(','), {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Unexpected error in like route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
