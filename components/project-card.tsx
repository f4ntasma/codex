import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink, Github, Eye } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Project } from '@/lib/supabase'

interface ProjectCardProps {
  project: Project
  onLike?: () => void
}

export function ProjectCard({ project, onLike }: ProjectCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border-border">
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.author_avatar || "/placeholder.svg"} alt={project.author} />
            <AvatarFallback>{project.author[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground font-medium">{project.author}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 gap-1 hover:bg-accent/50"
            onClick={onLike}
          >
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{project.stars}</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {project.github_url && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {project.demo_url && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <Link href={project.demo_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
