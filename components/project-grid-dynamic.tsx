'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ProjectCard } from "@/components/project-card"
import { ProjectModal } from "@/components/project-modal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchDebounce } from '@/lib/hooks/use-debounce'
import { appConfig } from '@/lib/config'
import { supabase } from '@/lib/supabase-client'
import type { Project } from '@/lib/types'
import { fetchWithAuth } from '@/lib/fetch-with-auth'

interface ProjectGridDynamicProps {
  limit: number | null
  showViewMore: boolean
  initialProjects?: Project[]
}

export function ProjectGridDynamic({ limit, showViewMore, initialProjects = [] }: ProjectGridDynamicProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Usar debounce para la búsqueda para evitar demasiadas consultas
  const { searchTerm: debouncedSearchTerm, shouldSearch, isSearching } = useSearchDebounce(
    searchTerm, 
    appConfig.search.minLength, 
    appConfig.search.debounceMs
  )

  // Cargar proyectos desde la API con manejo mejorado de errores y estados
  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (showFeaturedOnly) params.append('featured', 'true')
      if (shouldSearch) params.append('search', debouncedSearchTerm)

      // Usar fetchWithAuth para asegurar que el token se envía automáticamente
      const response = await fetchWithAuth(`/api/projects?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        // Manejar tanto el formato nuevo como el antiguo para compatibilidad
        const projectsArray = data.projects || data
        setProjects(Array.isArray(projectsArray) ? projectsArray : [])
        setError(null)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        setError(errorData.error || 'Error al cargar proyectos')
        console.error('Error loading projects:', response.statusText, errorData)
      }
    } catch (error) {
      const errorMessage = 'Error de conexión. Verifica tu conexión a internet.'
      setError(errorMessage)
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }, [limit, showFeaturedOnly, debouncedSearchTerm, shouldSearch])

  // Verificar autenticación antes de cargar proyectos
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        // Verificar sesión de Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setIsAuthenticated(true)
          
          // Obtener información del usuario directamente desde Supabase
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (!error && profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.avatar || undefined
              })
            }
          } catch (error) {
            console.error('Error fetching user:', error)
          }
          
          // Solo cargar proyectos si está autenticado y no hay proyectos iniciales
          if (initialProjects.length === 0) {
            loadProjects()
          }
        } else {
          setIsAuthenticated(false)
          setError('Debes iniciar sesión para ver los proyectos')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
        setError('Error al verificar autenticación')
      }
    }
    
    checkAuthAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjects.length])

  // Dar like a un proyecto (ahora usando ruta pública)
  const handleLike = useCallback(async (projectId: number) => {
    try {
      const response = await fetchWithAuth(`/api/projects/${projectId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        // Actualizar el proyecto en el estado local
        setProjects(prev => 
          prev.map(p => p.id === projectId ? { ...p, stars: result.project.stars } : p)
        )
        
        // Actualizar también el proyecto seleccionado si es el mismo
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject({ ...selectedProject, stars: result.project.stars })
        }
        
        // Opcional: mostrar mensaje de éxito
        console.log(result.message)
      } else {
        const errorData = await response.json()
        console.error('Error al dar like:', errorData.error)
      }
    } catch (error) {
      console.error('Error updating likes:', error)
    }
  }, [selectedProject])

  // Manejar apertura del modal
  const handleOpenModal = useCallback((project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }, [])

  // Manejar cierre del modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    // Mantener el proyecto seleccionado para que se pueda reabrir rápidamente
  }, [])

  // Manejar contratación
  const handleHire = useCallback(async (projectId: number) => {
    try {
      const response = await fetchWithAuth(`/api/projects/${projectId}/hire`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`¡Solicitud de contratación enviada! ${result.message}`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error hiring student:', error)
      alert('Error al enviar la solicitud de contratación')
    }
  }, [])

  const displayedProjects = useMemo(() => projects, [projects])

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {limit ? "Proyectos Destacados" : "Todos los Proyectos"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {limit
            ? "Descubre los proyectos más populares de nuestra comunidad"
            : `${projects.length} proyectos disponibles`}
        </p>

        {/* Filtros y búsqueda con indicadores de estado */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
            )}
            <input
              type="text"
              placeholder={`Buscar proyectos (mín. ${appConfig.search.minLength} caracteres)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button
            variant={showFeaturedOnly ? "default" : "outline"}
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className="gap-2"
            disabled={loading}
          >
            <Filter className="h-4 w-4" />
            {showFeaturedOnly ? "Todos" : "Destacados"}
          </Button>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm font-medium">⚠️ {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              className="mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reintentando...
                </>
              ) : (
                'Reintentar'
              )}
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: limit || 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64 mb-4"></div>
              <div className="bg-muted rounded h-4 mb-2"></div>
              <div className="bg-muted rounded h-3 mb-2"></div>
              <div className="bg-muted rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onLike={() => handleLike(project.id)}
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>
      )}

      {displayedProjects.length === 0 && !loading && isAuthenticated && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No se encontraron proyectos que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      {!isAuthenticated && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {error || 'Debes iniciar sesión para ver los proyectos.'}
          </p>
        </div>
      )}

      {showViewMore && !searchTerm && (
        <div className="mt-12 text-center">
          <Link href="/proyectos">
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              Ver Todos los Proyectos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Modal de proyecto */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLike={handleLike}
        userRole={user?.role}
        onHire={handleHire}
      />
    </section>
  )
}
