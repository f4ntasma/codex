import { Header } from "@/components/header"
import { ProjectGridDynamic } from "@/components/project-grid-dynamic"

export default function AllProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to dashborad wazaaaaa</h1>
          <p className="text-muted-foreground text-lg">
            Explora todos los proyectos creados por estudiantes de nuestra universidad!
          </p>
        </div>
        <ProjectGridDynamic limit={null} showViewMore={false} />
      </main>
    </div>
  )
}
