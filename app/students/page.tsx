'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter,
  User,
  Mail,
  Github,
  ExternalLink,
  GraduationCap,
  BookOpen,
  MapPin,
  Calendar
} from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  avatar: string
  university: string
  career: string
  semester: number
  location: string
  skills: string[]
  github_url: string
  portfolio_url: string
  joined_date: string
  projects_count: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [loading, setLoading] = useState(true)

  // Skills únicas para el filtro
  const allSkills = Array.from(new Set(students.flatMap(student => student.skills)))

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, selectedSkill, students])

  const loadStudents = async () => {
    try {
      // En una implementación real, esto vendría de tu API
      const mockStudents: Student[] = [
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
          portfolio_url: 'https://xD.com',
          joined_date: '2023-01-15',
          projects_count: 5
        },
        {
          id: '2',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@universidad.edu',
          avatar: '',
          university: 'Universidad de los Andes',
          career: 'Ciencia de la Computación',
          semester: 6,
          location: 'Medellín, Colombia',
          skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
          github_url: 'https://github.com/carlosrodriguez',
          portfolio_url: 'https://carlosrodriguez.dev',
          joined_date: '2023-03-20',
          projects_count: 3
        },
        {
          id: '3',
          name: 'Ana Martínez',
          email: 'ana.martinez@universidad.edu',
          avatar: '',
          university: 'Universidad Javeriana',
          career: 'Diseño Gráfico',
          semester: 7,
          location: 'Cali, Colombia',
          skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'React'],
          github_url: 'https://github.com/anamartinez',
          portfolio_url: 'https://anamartinez.design',
          joined_date: '2023-02-10',
          projects_count: 4
        }
      ]
      
      setStudents(mockStudents)
      setFilteredStudents(mockStudents)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.career.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedSkill) {
      filtered = filtered.filter(student =>
        student.skills.includes(selectedSkill)
      )
    }

    setFilteredStudents(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSkill('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">XDDDD</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Comunidad de Estudiantes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce a los talentosos estudiantes que están creando proyectos increíbles 
            y conecta con futuros colaboradores.
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, carrera, universidad o tecnología..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por skill */}
              <div className="w-full md:w-64">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Todas las tecnologías</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              {/* Limpiar filtros */}
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!searchTerm && !selectedSkill}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">{students.length}</div>
              <div className="text-sm text-muted-foreground">Estudiantes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">
                {Array.from(new Set(students.map(s => s.university))).length}
              </div>
              <div className="text-sm text-muted-foreground">Universidades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">
                {allSkills.length}
              </div>
              <div className="text-sm text-muted-foreground">Tecnologías</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">
                {students.reduce((acc, student) => acc + student.projects_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Proyectos</div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Estudiantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información académica */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{student.career}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{student.university} • Semestre {student.semester}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{student.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Miembro desde {new Date(student.joined_date).getFullYear()}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Tecnologías:</h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Estadísticas y enlaces */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    {student.projects_count} proyecto{student.projects_count !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2">
                    {student.github_url && (
                      <a 
                        href={student.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {student.portfolio_url && (
                      <a 
                        href={student.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Botón de contacto */}
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${student.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron estudiantes
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </main>
    </div>
  )
}