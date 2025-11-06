'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { StudentGuard } from "@/components/auth-guard"
import { ProjectGridDynamic } from "@/components/project-grid-dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Eye, Star, TrendingUp, Activity, Plus, X, 
  Github, ExternalLink, User, FileText, Tag, Image as ImageIcon,
  Loader2, CheckCircle, AlertCircle, Upload
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Project } from '@/lib/types'
import { fetchWithAuth } from "@/lib/fetch-with-auth"

function StudentsProjectsPageContent() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalViews: 0,
    totalStars: 0,
    featuredProjects: 0
  })
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    author_avatar: '',
    image: '',
    github_url: '',
    demo_url: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Cargar proyectos y estadísticas
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchWithAuth('/api/projects')
        if (response.ok) {
          const data = await response.json()
          const projectsArray = data.projects || data
          const projectsList = Array.isArray(projectsArray) ? projectsArray : []
          
          // Calcular estadísticas
          const totalViews = projectsList.reduce((sum: number, p: Project) => sum + (p.views || 0), 0)
          const totalStars = projectsList.reduce((sum: number, p: Project) => sum + (p.stars || 0), 0)
          const featuredProjects = projectsList.filter((p: Project) => p.featured).length
          
          setStats({
            totalProjects: projectsList.length,
            totalViews,
            totalStars,
            featuredProjects
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
    
    // Actualizar cada 30 segundos para mantener datos en tiempo real
    const interval = setInterval(loadData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Agregar tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 8) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Manejar cambios en inputs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Enviar proyecto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      if (!formData.title.trim() || !formData.description.trim() || !formData.author.trim()) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      if (formData.description.length < 50) {
        throw new Error('La descripción debe tener al menos 50 caracteres')
      }

      if (formData.tags.length === 0) {
        throw new Error('Agrega al menos una tecnología/tag')
      }

      const response = await fetchWithAuth('/api/projects', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir el proyecto')
      }

      setSubmitSuccess(true)
      
      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          author: '',
          author_avatar: '',
          image: '',
          github_url: '',
          demo_url: '',
          tags: []
        })
        setSubmitSuccess(false)
        setShowCreateForm(false)
        // Recargar proyectos
        window.location.reload()
      }, 3000)

    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      author: '',
      author_avatar: '',
      image: '',
      github_url: '',
      demo_url: '',
      tags: []
    })
    setNewTag('')
    setShowCreateForm(false)
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Proyectos de la Comunidad</h1>
            <p className="text-muted-foreground text-lg">
              Explora y comenta los proyectos creados por estudiantes.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Subir Proyecto
          </Button>
        </div>

        {/* Formulario de creación con vista previa en tiempo real */}
        {showCreateForm && (
          <div className="mb-8 rounded-2xl p-[1px] bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30">
            <Card className="rounded-2xl border-0 shadow-xl">
              <CardHeader className="rounded-t-2xl bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Upload className="h-5 w-5" />
                      Subir Nuevo Proyecto
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Completa los campos y visualiza a la derecha cómo se verá tu tarjeta en tiempo real.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Grid principal: formulario + preview */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Columna izquierda: campos */}
                    <div className="md:col-span-3 space-y-4">
                      {/* Título */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Título del Proyecto *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Ej: Sistema de Gestión Académica"
                          maxLength={100}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.title.length}/100 caracteres
                        </p>
                      </div>

                      {/* Descripción */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Descripción *
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe tu proyecto..."
                          rows={4}
                          maxLength={500}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.description.length}/500 caracteres (mínimo 50)
                        </p>
                      </div>

                      {/* Autor */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Tu Nombre *
                        </label>
                        <Input
                          value={formData.author}
                          onChange={(e) => handleInputChange('author', e.target.value)}
                          placeholder="Ej: María González"
                          maxLength={50}
                          required
                        />
                      </div>

                      {/* URLs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            GitHub (opcional)
                          </label>
                          <Input
                            value={formData.github_url}
                            onChange={(e) => handleInputChange('github_url', e.target.value)}
                            placeholder="https://github.com/usuario/proyecto"
                            type="url"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            Demo/Sitio Web (opcional)
                          </label>
                          <Input
                            value={formData.demo_url}
                            onChange={(e) => handleInputChange('demo_url', e.target.value)}
                            placeholder="https://mi-proyecto.com"
                            type="url"
                          />
                        </div>
                      </div>

                      {/* Imágenes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            Imagen del Proyecto (opcional)
                          </label>
                          <Input
                            value={formData.image}
                            onChange={(e) => handleInputChange('image', e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            type="url"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Tu Foto (opcional)
                          </label>
                          <Input
                            value={formData.author_avatar}
                            onChange={(e) => handleInputChange('author_avatar', e.target.value)}
                            placeholder="https://ejemplo.com/tu-foto.jpg"
                            type="url"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          Tecnologías Utilizadas *
                        </label>
                        <div className="flex gap-2 mb-3">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Ej: React, Node.js, Python..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            maxLength={20}
                          />
                          <Button 
                            type="button" 
                            onClick={addTag}
                            variant="outline"
                            disabled={!newTag.trim() || formData.tags.length >= 8}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formData.tags.length}/8 tecnologías (mínimo 1)
                        </p>
                      </div>

                      {/* Mensajes de estado */}
                      {submitError && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Error:</span>
                          </div>
                          <p className="text-sm text-destructive mt-1">{submitError}</p>
                        </div>
                      )}

                      {submitSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">¡Éxito!</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Tu proyecto ha sido subido exitosamente.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha: vista previa en tiempo real */}
                    <div className="md:col-span-2">
                      <div className="sticky top-8">
                        <Card className="border-2 border-primary/20">
                          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Eye className="h-5 w-5 text-primary" />
                              Vista Previa en Tiempo Real
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Los cambios se reflejan instantáneamente mientras editas
                            </p>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="rounded-xl border border-border bg-muted/20 overflow-hidden shadow-lg">
                              {/* Imagen del proyecto */}
                              <div className="h-48 w-full bg-gradient-to-br from-primary/25 via-accent/25 to-transparent flex items-center justify-center relative overflow-hidden">
                                {formData.image ? (
                                  <img
                                    src={formData.image}
                                    alt="Vista previa"
                                    className="h-48 w-full object-cover transition-opacity duration-200"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="text-xs text-muted-foreground flex flex-col items-center gap-2">
                                    <ImageIcon className="h-8 w-8" />
                                    <span>Vista previa de imagen</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Contenido de la tarjeta */}
                              <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                                    {formData.title || 'Título del proyecto'}
                                  </h3>
                                </div>
                                
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {formData.description || 'Aquí aparecerá la descripción corta del proyecto.'}
                                </p>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                  {formData.tags.length > 0 ? (
                                    formData.tags.slice(0, 5).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="rounded-full text-xs">
                                        {tag}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Agrega tecnologías...</span>
                                  )}
                                </div>
                                
                                {/* Footer de la tarjeta */}
                                <div className="pt-3 border-t border-border flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={formData.author_avatar || "/placeholder.svg"} alt={formData.author || "Autor"} />
                                      <AvatarFallback>
                                        {formData.author ? formData.author[0].toUpperCase() : 'A'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-foreground font-medium">
                                      {formData.author || 'Tu nombre'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-2 gap-1"
                                      disabled
                                    >
                                      <Star className="h-4 w-4 fill-accent text-accent" />
                                      <span className="text-sm font-medium">0</span>
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                      {formData.github_url && (
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-8 w-8 p-0"
                                          asChild
                                        >
                                          <a href={formData.github_url} target="_blank" rel="noopener noreferrer">
                                            <Github className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      )}
                                      {formData.demo_url && (
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-8 w-8 p-0"
                                          asChild
                                        >
                                          <a href={formData.demo_url} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Footer de acciones */}
                  <div className="-mx-6 -mb-6 px-6 py-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-b-2xl flex items-center justify-end gap-2">
                    <Button 
                      type="submit" 
                      disabled={submitting || submitSuccess}
                      className="gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : submitSuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          ¡Subido!
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Subir Proyecto
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estadísticas en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? 'Cargando...' : 'Proyectos activos'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visualizaciones</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                En tiempo real
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalStars.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? 'Cargando...' : 'Likes de la comunidad'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destacados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.featuredProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? 'Cargando...' : 'Proyectos destacados'}
              </p>
            </CardContent>
          </Card>
        </div>

        <ProjectGridDynamic limit={null} showViewMore={false} />
      </main>
    </div>
  )
}

export default function StudentsPage() {
  return (
    <StudentGuard>
      <StudentsProjectsPageContent />
    </StudentGuard>
  )
}