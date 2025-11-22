'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star,
  ExternalLink,
  Github,
  Eye,
  X,
  Minimize2,
  Maximize2,
  Calendar,
  User,
  Users,
  Briefcase,
  MessageSquare,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectViewers } from '@/components/project-viewers'
import type { Project } from '@/lib/types'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onLike?: (projectId: number) => void
  userRole?: 'student' | 'corporate' | 'admin'
  onHire?: (projectId: number) => void
}

export function ProjectModal({ project, isOpen, onClose, onLike, userRole, onHire }: ProjectModalProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const [showCommentsSection, setShowCommentsSection] = useState(true)
  const [comments, setComments] = useState<
    { id: number; project_id: number; author: string | null; content: string; created_at: string }[]
  >([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = () => {
    if (onLike && project) {
      onLike(project.id)
    }
  }

  const handleHire = () => {
    if (onHire && project) {
      onHire(project.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false)
      setShowViewers(false)
      setShowCommentsSection(true)

      if (project?.id) {
        fetch(`/api/projects/${project.id}/views`, { method: 'POST' }).catch(() => null)

        fetch(`/api/projects/${project.id}/comments`)
          .then(res => res.json())
          .then(data => setComments(Array.isArray(data?.comments) ? data.comments : []))
          .catch(() => setComments([]))
      }
    }
  }, [isOpen, project?.id])

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen || !project) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <Card
          className={`w-[95vw] max-w-6xl max-h-[90vh] border-border shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-auto' : 'h-full'
          } ${isAnimating ? 'animate-in zoom-in-95' : ''}`}
        >
          <CardHeader className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={project.author_avatar || '/placeholder.svg'} alt={project.author} />
                  <AvatarFallback>{project.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground line-clamp-1">{project.title}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {project.author}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLike}
                  className="h-8 px-2 gap-1 hover:bg-accent/50"
                >
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{project.stars}</span>
                </Button>

                {!isMinimized && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowViewers(!showViewers)}
                    className="h-8 px-2 gap-1"
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Viewers</span>
                  </Button>
                )}

                <Button size="sm" variant="ghost" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 p-0">
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>

                <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0 hover:bg-destructive/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
              <div className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Titulo</span>
                    <span className="text-lg font-bold text-foreground line-clamp-1">{project.title}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleLike}
                      className="h-10 w-10 rounded-full border border-border/70"
                    >
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="sr-only">Like</span>
                    </Button>
                    <span className="text-sm font-semibold text-foreground">{project.stars}</span>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.2fr,1fr] items-start">
                  <div className="relative rounded-2xl border border-border/70 bg-muted shadow-sm min-h-[320px]">
                    <div className="relative h-[320px] md:h-[420px] overflow-hidden rounded-xl">
                      <Image
                        src={project.image || '/placeholder.svg'}
                        alt={project.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <div className="flex h-9 items-center rounded-full border border-border/70 bg-background/80 px-3 text-sm font-semibold text-foreground shadow-sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Descripcion
                      </div>
                      <p className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="rounded-xl">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {project.github_url && (
                        <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                          <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            Ver Codigo
                          </Link>
                        </Button>
                      )}
                      {project.demo_url && (
                        <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                          <Link href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Ver Demo
                          </Link>
                        </Button>
                      )}
                      {!project.github_url && !project.demo_url && (
                        <p className="text-sm text-muted-foreground">No hay enlaces disponibles</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {formatDate(project.created_at)}</span>
                        {project.updated_at !== project.created_at && (
                          <>
                            <span>-</span>
                            <span>Actualizado: {formatDate(project.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {userRole === 'corporate' && onHire && (
                      <div className="mt-auto flex justify-end">
                        <Button variant="default" size="sm" className="gap-2 rounded-xl" onClick={handleHire}>
                          <Briefcase className="h-4 w-4" />
                          Contratar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
                  <Avatar className="h-12 w-12 border border-border/70">
                    <AvatarImage src={project.author_avatar || '/placeholder.svg'} alt={project.author} />
                    <AvatarFallback>{project.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowCommentsSection(prev => !prev)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comentarios ({comments.length})
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      asChild={Boolean(project.demo_url || project.github_url)}
                      disabled={!project.demo_url && !project.github_url}
                    >
                      {project.demo_url || project.github_url ? (
                        <Link
                          href={project.demo_url || project.github_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3"
                        >
                          <Eye className="h-4 w-4" />
                          Ver mas
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 px-3">
                          <Eye className="h-4 w-4" />
                          Ver mas
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {showCommentsSection && (
                <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comentarios
                  </h3>
                  <div className="space-y-3">
                    {comments.length === 0 && <p className="text-sm text-muted-foreground">Se el primero en comentar.</p>}
                    {comments.map(c => (
                      <div key={c.id} className="border border-border rounded-xl p-3 bg-background">
                        <div className="text-sm text-foreground whitespace-pre-wrap">{c.content}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.author ? c.author : 'Anonimo'} - {formatDate(c.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={async e => {
                      e.preventDefault()
                      if (!project?.id || !newComment.trim()) return
                      setIsSubmitting(true)
                      try {
                        const res = await fetch(`/api/projects/${project.id}/comments`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: newComment }),
                        })
                        const data = await res.json()
                        if (res.ok && data?.comment) {
                          setComments(prev => [...prev, data.comment])
                          setNewComment('')
                        }
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                    />
                    <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
                      Enviar
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          )}

          {showViewers && !isMinimized && (
            <CardContent className="border-t border-border">
              <ProjectViewers projectId={project.id} isOpen={showViewers} />
            </CardContent>
          )}

          {isMinimized && (
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={project.image || '/placeholder.svg'}
                      alt={project.title}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={handleLike} className="h-8 px-2 gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {project.stars}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  )
}
