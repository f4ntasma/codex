import { NextResponse } from 'next/server'

const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET || ''

export async function POST(request: Request) {
  if (!HCAPTCHA_SECRET) {
    return NextResponse.json({ success: false, error: 'HCaptcha secret no configurado' }, { status: 500 })
  }

  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token de captcha faltante' }, { status: 400 })
    }

    const formData = new URLSearchParams()
    formData.append('response', token)
    formData.append('secret', HCAPTCHA_SECRET)

    const hcRes = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })

    const result = await hcRes.json()
    if (result.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: result['error-codes']?.join(', ') || 'Captcha inválido' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error verificando captcha' }, { status: 500 })
  }
}
