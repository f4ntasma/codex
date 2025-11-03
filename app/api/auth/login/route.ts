import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password)
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })

    // 🔐 Login directo contra Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error || !data.user)
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

    // Recuperar rol desde tabla profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const userData = {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'student',
    }

    return NextResponse.json({ user: userData })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}