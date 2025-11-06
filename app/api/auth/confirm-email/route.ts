import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * Endpoint temporal para confirmar automáticamente el email de un usuario
 * Esto desactiva temporalmente la verificación de correo
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }

    // Buscar el usuario por email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: 'Error al buscar usuario' }, { status: 500 })
    }

    const user = users.find(u => u.email === email.trim())

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Confirmar el email automáticamente usando el admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('Error confirming email:', updateError)
      return NextResponse.json({ error: 'Error al confirmar email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmado automáticamente',
      user: updatedUser.user
    })
  } catch (err) {
    console.error('Confirm email error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

