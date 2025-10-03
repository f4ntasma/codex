import { NextRequest, NextResponse } from 'next/server'
import { createLogoutResponse } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    return createLogoutResponse()
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
