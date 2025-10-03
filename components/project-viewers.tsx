'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Users, TrendingUp, Clock, UserCheck } from "lucide-react"
import type { ProjectViewStats } from '@/lib/project-views'

interface ProjectViewersProps {
  projectId: number
  isOpen: boolean
}

export function ProjectViewers({ projectId, isOpen }: ProjectViewersProps) {
  const [stats, setStats] = useState<ProjectViewStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      loadViewStats()
    }
  }, [isOpen, projectId])

  const loadViewStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/views`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading view stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-500'
      case 'corporate': return 'bg-green-500'
      case 'admin': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Estudiante'
      case 'corporate': return 'Intercorp'
      case 'admin': return 'Admin'
      default: return role
    }
  }

  if (!isOpen) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visualizaciones del Proyecto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded h-4 mb-2"></div>
                <div className="bg-muted rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.total_views}</div>
                <div className="text-sm text-muted-foreground">Total visualizaciones</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.unique_viewers}</div>
                <div className="text-sm text-muted-foreground">Usuarios únicos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <UserCheck className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {stats.views_by_role.corporate}
                </div>
                <div className="text-sm text-muted-foreground">Vistas corporativas</div>
              </div>
            </div>

            {/* Distribución por roles */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Distribución por Roles</h4>
              <div className="space-y-2">
                {Object.entries(stats.views_by_role).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getRoleColor(role)}`}></div>
                      <span className="text-sm text-foreground">{getRoleLabel(role)}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Viewers recientes */}
            {stats.recent_viewers.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Viewers Recientes</h4>
                <div className="space-y-3">
                  {stats.recent_viewers.map((viewer) => (
                    <div key={`${viewer.user_id}-${viewer.viewed_at}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={viewer.user_avatar || "/placeholder-user.jpg"} alt={viewer.user_name} />
                        <AvatarFallback>{viewer.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{viewer.user_name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoleColor(viewer.user_role)} text-white border-0`}
                          >
                            {getRoleLabel(viewer.user_role)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(viewer.viewed_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.recent_viewers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay visualizaciones recientes</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error al cargar las estadísticas</p>
            <Button variant="outline" size="sm" onClick={loadViewStats} className="mt-2">
              Reintentar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
