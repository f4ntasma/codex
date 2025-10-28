import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST -> Dar like a un proyecto
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Incrementar el contador de stars
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

    // Log de la acción
    console.log(`Like agregado al proyecto: ${data.title} (${data.stars} stars)`)

    return NextResponse.json({
      success: true,
      project: data,
      message: '¡Gracias por tu like!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error in like route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
