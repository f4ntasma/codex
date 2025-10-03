import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = Number(params.id)
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('project_comments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comments: data ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = Number(params.id)
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  const author = typeof body?.author === 'string' ? body.author.trim() : null

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('project_comments')
    .insert({ project_id: projectId, content, author })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment: data }, { status: 201 })
}


