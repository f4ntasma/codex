'use client'

import { useState, memo } from 'react'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Plus, 
  X, 
  Github, 
  ExternalLink, 
  User, 
  FileText, 
  Tag,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Star
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Memoizamos el Header para evitar que se re-renderice con cada cambio en el formulario
const MemoizedHeader = memo(Header);

export default function SubirProyectoPage() {
  // Estados del formulario pe
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
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Agregar tag al proyecto perra xD
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 8) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remover tag del proyecto perra xD
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Manejar cambios en inputs perra xD
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Enviar formulario perra xD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones básicas perra xD
      if (!formData.title.trim() || !formData.description.trim() || !formData.author.trim()) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      if (formData.description.length < 50) {
        throw new Error('La descripción debe tener al menos 50 caracteres')
      }

      if (formData.tags.length === 0) {
        throw new Error('Agrega al menos una tecnología/tag')
      }

      // Enviar a la API perra xD
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir el proyecto')
      }

      const result = await response.json()
      console.log('Proyecto creado:', result)
      
      setSuccess(true)
      
      // Limpiar formulario después de 3 segundos perra xD
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
        setSuccess(false)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MemoizedHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header de la página perra xD */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Comparte tu Proyecto
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Has creado algo increíble? ¡Compártelo con la comunidad universitaria! 
            Sube tu proyecto y ayuda a inspirar a otros estudiantes.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Formulario principal */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl p-[1px] bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30">
                <Card className="rounded-2xl border-0 shadow-xl">
                  <CardHeader className="rounded-t-2xl bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Información del Proyecto
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Completa los campos y visualiza a la derecha cómo se verá tu tarjeta.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Título del proyecto perra xD */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <FileText className="h-4 w-4 inline mr-1" />
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
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Descripción del Proyecto *
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe tu proyecto: qué hace, cómo funciona, qué problema resuelve..."
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
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <User className="h-4 w-4 inline mr-1" />
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

                    {/* URLs opcionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          <Github className="h-4 w-4 inline mr-1" />
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
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          <ExternalLink className="h-4 w-4 inline mr-1" />
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

                    {/* URLs de imágenes opcionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          <ImageIcon className="h-4 w-4 inline mr-1" />
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
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          <User className="h-4 w-4 inline mr-1" />
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
                    

                    {/* Tags/Tecnologías */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <Tag className="h-4 w-4 inline mr-1" />
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
                      
                      {/* Tags agregados */}
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
                    {error && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Error:</span>
                        </div>
                        <p className="text-sm text-destructive mt-1">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">¡Éxito!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Tu proyecto ha sido subido exitosamente. ¡Gracias por compartir!
                        </p>
                      </div>
                    )}

                      {/* Footer de acciones */}
                      <div className="-mx-6 -mb-6 px-6 py-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-b-2xl flex items-center justify-end gap-2">
                        <Button 
                          type="submit" 
                          disabled={loading || success}
                          className="gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Subiendo...
                            </>
                          ) : success ? (
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
                          onClick={() => window.history.back()}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Columna derecha: Vista previa en tiempo real */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vista previa de la tarjeta */}
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Vista Previa
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Así se verá tu proyecto en la plataforma
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                    {/* Imagen del proyecto */}
                    <div className="h-48 w-full bg-gradient-to-br from-primary/25 via-accent/25 to-transparent flex items-center justify-center relative overflow-hidden">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Vista previa"
                          className="h-48 w-full object-cover"
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

              {/* Panel lateral con información */}
              <div className="space-y-6">
              {/* Consejos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Consejos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Título claro:</strong> Usa un nombre descriptivo que explique qué hace tu proyecto.
                  </div>
                  <div>
                    <strong>Descripción detallada:</strong> Explica el problema que resuelve y cómo funciona.
                  </div>
                  <div>
                    <strong>Tecnologías:</strong> Menciona las herramientas y lenguajes que usaste.
                  </div>
                  <div>
                    <strong>Enlaces:</strong> Incluye GitHub para que otros puedan ver el código.
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Comunidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Proyectos totales:</span>
                    <span className="font-medium">500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estudiantes activos:</span>
                    <span className="font-medium">1,200+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Universidades:</span>
                    <span className="font-medium">25+</span>
                  </div>
                </CardContent>
              </Card>

              {/* Navegación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔗 Enlaces Útiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/" className="block text-sm text-primary hover:underline">
                    Ver todos los proyectos
                  </Link>
                  <Link href="/proyectos" className="block text-sm text-primary hover:underline">
                    Explorar por categorías
                  </Link>
                  <Link href="#" className="block text-sm text-primary hover:underline">
                    Guía para estudiantes
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
