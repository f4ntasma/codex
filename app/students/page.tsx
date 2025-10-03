'use client'

import { Header } from "@/components/header"
import { StudentGuard } from "@/components/auth-guard"
import { ProjectGridDynamic } from "@/components/project-grid-dynamic"

function StudentsProjectsPageContent() {
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