import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

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

    // Solo usuarios corporativos pueden contratar
    if (user.role !== 'corporate' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo usuarios corporativos pueden contratar estudiantes' },
        { status: 403 }
      )
    }

    const projectId = parseInt(params.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'ID de proyecto inválido' },
        { status: 400 }
      )
    }

    // Aquí se podría implementar la lógica de contratación
    // Por ejemplo, enviar un email, crear una notificación, etc.
    
    // Por ahora, solo registramos la intención de contratación
    console.log(`Usuario ${user.name} (${user.email}) quiere contratar al autor del proyecto ${projectId}`)

    return NextResponse.json({
      message: 'Solicitud de contratación enviada exitosamente. Nos pondremos en contacto contigo pronto.',
      projectId,
      requestedBy: {
        name: user.name,
        email: user.email,
        company: user.company
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing hire request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
