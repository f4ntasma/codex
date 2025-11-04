'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { StudentGuard } from "@/components/auth-guard"
import { ProjectGridDynamic } from "@/components/project-grid-dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Eye, Star, TrendingUp, Activity } from "lucide-react"
import type { Project } from '@/lib/types'

function StudentsProjectsPageContent() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalViews: 0,
    totalStars: 0,
    featuredProjects: 0
  })
  const [loading, setLoading] = useState(true)

  // Cargar proyectos y estadísticas
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/projects')
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Proyectos de la Comunidad</h1>
          <p className="text-muted-foreground text-lg">
            Explora y comenta los proyectos creados por estudiantes.
          </p>
        </div>

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