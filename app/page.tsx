'use client'

import { Header } from "@/components/header"
import { ProjectGridDynamic } from "@/components/project-grid-dynamic"
import { HeroSection } from "@/components/hero-section"
import { AuthGuard } from "@/components/auth-guard"

function HomePageContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProjectGridDynamic limit={24} showViewMore={true} />
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomePageContent />
    </AuthGuard>
  )
}
