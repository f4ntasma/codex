import { NextRequest, NextResponse } from 'next/server'
import { getProjectViews, trackProjectView } from '@/lib/project-views'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'ID de proyecto inválido' },
        { status: 400 }
      )
    }

    const stats = await getProjectViews(projectId)
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Error al obtener estadísticas de visualización' },
        { status: 500 }
      )
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching project views:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const projectId = parseInt(params.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'ID de proyecto inválido' },
        { status: 400 }
      )
    }

    const viewData = await trackProjectView(
      projectId,
      user.id,
      user.name,
      user.role
    )
    
    if (!viewData) {
      return NextResponse.json(
        { error: 'Error al registrar visualización' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Visualización registrada exitosamente',
      view: viewData
    })
  } catch (error) {
    console.error('Error tracking project view:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
