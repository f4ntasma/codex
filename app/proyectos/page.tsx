import { Header } from "@/components/header"
import { ProjectGrid } from "@/components/project-grid"

export default function AllProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Todos los Proyectos</h1>
          <p className="text-muted-foreground text-lg">
            Explora todos los proyectos creados por estudiantes de nuestra universidad
          </p>
        </div>
        <ProjectGrid limit={null} showViewMore={false} />
      </main>
    </div>
  )
}
