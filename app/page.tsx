import { Header } from "@/components/header"
import { ProjectGrid } from "@/components/project-grid"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProjectGrid limit={24} showViewMore={true} />
      </main>
    </div>
  )
}
