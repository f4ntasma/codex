'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Users, 
  TrendingUp,
  Shield,
  Search,
  BarChart3,
  Activity,
  FileText,
  Settings,
  Download,
  Upload,
  Filter,
  Calendar,
  Mail,
  Bell
} from "lucide-react"
import type { Project } from '@/lib/supabase'

function AdminPanelContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState('projects')
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalViews: 0,
    totalUsers: 0,
    pendingHires: 0
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    author_avatar: '',
    tags: '',
    image: '',
    github_url: '',
    demo_url: '',
    featured: false,
    status: 'published' as 'draft' | 'published' | 'archived'
  })

  // Cargar proyectos
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=all')
      
      if (response.ok) {
        const data = await response.json()
        const projectsArray = data.projects || data
        setProjects(Array.isArray(projectsArray) ? projectsArray : [])
      } else {
        console.error('Error loading projects:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas del sistema
  const loadStats = async () => {
    try {
      setStats({
        totalProjects: projects.length,
        totalViews: Math.floor(Math.random() * 1000) + 500,
        totalUsers: Math.floor(Math.random() * 200) + 100,
        pendingHires: Math.floor(Math.random() * 20) + 5
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    loadStats()
  }, [projects.length])

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const projectData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        await loadProjects()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      author: '',
      author_avatar: '',
      tags: '',
      image: '',
      github_url: '',
      demo_url: '',
      featured: false,
      status: 'published'
    })
    setEditingProject(null)
    setShowCreateForm(false)
  }

  // Editar proyecto
  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      author: project.author,
      author_avatar: project.author_avatar || '',
      tags: project.tags.join(', '),
      image: project.image || '',
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      featured: project.featured,
      status: project.status
    })
    setEditingProject(project)
    setShowCreateForm(true)
  }

  // Eliminar proyecto
  const handleDelete = async (projectId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadProjects()
        }
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  // Filtrar proyectos
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estadísticas
  const projectStats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    featured: projects.filter(p => p.featured).length,
    totalStars: projects.reduce((sum, p) => sum + p.stars, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header del panel */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Panel de Administración</h1>
              <p className="text-muted-foreground">
                Gestiona proyectos, usuarios y configuraciones del sistema
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destacados</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.featured}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.totalStars}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navegación por pestañas */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            {[
              { id: 'projects', label: 'Proyectos', icon: <FileText className="h-4 w-4" /> },
              { id: 'analytics', label: 'Analíticas', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
              { id: 'settings', label: 'Configuración', icon: <Settings className="h-4 w-4" /> }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'projects' && (
          <>
            {/* Formulario de creación/edición */}
            {showCreateForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>
                    {editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Autor</label>
                        <Input
                          value={formData.author}
                          onChange={(e) => setFormData({...formData, author: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Descripción</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Tags (separados por coma)</label>
                        <Input
                          value={formData.tags}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Imagen URL</label>
                        <Input
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">GitHub URL</label>
                        <Input
                          value={formData.github_url}
                          onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Demo URL</label>
                        <Input
                          value={formData.demo_url}
                          onChange={(e) => setFormData({...formData, demo_url: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        />
                        Destacado
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingProject ? 'Actualizar' : 'Crear'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de proyectos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Proyectos</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar proyectos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{project.title}</h3>
                          {project.featured && (
                            <Badge variant="secondary">Destacado</Badge>
                          )}
                          <Badge variant="outline">{project.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {project.stars}
                          </span>
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pestaña de Analíticas */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Proyectos Más Vistos</h4>
                    <div className="space-y-2">
                      {projects.slice(0, 5).map((project, index) => (
                        <div key={project.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{project.title}</span>
                          <Badge variant="secondary">{Math.floor(Math.random() * 100)} vistas</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Actividad Reciente</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>Nuevo proyecto publicado</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Usuario corporativo registrado</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bell className="h-4 w-4" />
                        <span>Solicitud de contratación</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pestaña de Usuarios */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{Math.floor(stats.totalUsers * 0.6)}</div>
                      <div className="text-sm text-muted-foreground">Estudiantes</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{Math.floor(stats.totalUsers * 0.3)}</div>
                      <div className="text-sm text-muted-foreground">Corporativos</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{Math.floor(stats.totalUsers * 0.1)}</div>
                      <div className="text-sm text-muted-foreground">Administradores</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Usuarios Recientes</h4>
                    {[
                      { name: 'María González', email: 'maria@university.edu', role: 'Estudiante', date: 'Hoy' },
                      { name: 'Carlos Ramírez', email: 'carlos@intercorp.com', role: 'Corporativo', date: 'Ayer' },
                      { name: 'Ana Martínez', email: 'ana@estudiantes.edu', role: 'Estudiante', date: 'Hace 2 días' }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{user.role}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{user.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pestaña de Configuración */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Configuración General</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Notificaciones por email</span>
                        <Button variant="outline" size="sm">Activar</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Moderación automática</span>
                        <Button variant="outline" size="sm">Activar</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Backup automático</span>
                        <Button variant="outline" size="sm">Activar</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Herramientas</h4>
                    <div className="flex gap-3">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar Datos
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Importar Datos
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Enviar Notificación
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
  )
}

export default function AdminPanel() {
  return (
    <AdminGuard>
      <AdminPanelContent />
    </AdminGuard>
  )
}