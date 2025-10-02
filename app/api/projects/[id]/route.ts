import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'
import type { ProjectUpdate } from '@/lib/supabase'

// GET - Obtener proyecto por ID (PÚBLICO - cualquiera puede ver)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Proyecto no encontrado' },
          { status: 404 }
        )
      }
      console.error('Error fetching project:', error)
      return NextResponse.json(
        { error: 'Error al obtener proyecto' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar proyecto (SIN AUTENTICACIÓN - acceso libre)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Sin verificación de autenticación - acceso libre

    const body = await request.json()
    const updateData: ProjectUpdate = {}

    // Solo actualizar campos proporcionados
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.author !== undefined) updateData.author = body.author
    if (body.author_avatar !== undefined) updateData.author_avatar = body.author_avatar
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.stars !== undefined) updateData.stars = body.stars
    if (body.image !== undefined) updateData.image = body.image
    if (body.github_url !== undefined) updateData.github_url = body.github_url
    if (body.demo_url !== undefined) updateData.demo_url = body.demo_url
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.status !== undefined) updateData.status = body.status

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Proyecto no encontrado' },
          { status: 404 }
        )
      }
      console.error('Error updating project:', error)
      return NextResponse.json(
        { error: 'Error al actualizar proyecto' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar proyecto (SIN AUTENTICACIÓN - acceso libre)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Sin verificación de autenticación - acceso libre

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json(
        { error: 'Error al eliminar proyecto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Proyecto eliminado exitosamente' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
