import { NextRequest, NextResponse } from 'next/server'

// Datos mock - en producción esto vendría de una base de datos
const students = [
  {
    id: '1',
    name: 'María González',
    email: 'maria.gonzalez@universidad.edu',
    avatar: '',
    university: 'Universidad Nacional',
    career: 'Ingeniería de Sistemas',
    semester: 8,
    location: 'Bogotá, Colombia',
    skills: ['React', 'Node.js', 'TypeScript', 'Python'],
    github_url: 'https://github.com/mariagonzalez',
    portfolio_url: 'https://mariagonzalez.dev',
    joined_date: '2023-01-15',
    projects_count: 5
  },
  // ... más estudiantes
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const skill = searchParams.get('skill') || ''

    let filteredStudents = students

    // Filtrar por búsqueda
    if (search) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.career.toLowerCase().includes(search.toLowerCase()) ||
        student.university.toLowerCase().includes(search.toLowerCase()) ||
        student.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Filtrar por skill
    if (skill) {
      filteredStudents = filteredStudents.filter(student =>
        student.skills.includes(skill)
      )
    }

    return NextResponse.json(filteredStudents)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al cargar estudiantes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.name || !body.email || !body.university || !body.career) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Crear nuevo estudiante
    const newStudent = {
      id: (students.length + 1).toString(),
      ...body,
      joined_date: new Date().toISOString().split('T')[0],
      projects_count: 0
    }

    // En producción, guardar en base de datos
    students.push(newStudent)

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear estudiante' },
      { status: 500 }
    )
  }
}