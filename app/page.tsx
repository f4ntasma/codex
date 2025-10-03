'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { ProjectGridDynamic } from "@/components/project-grid-dynamic"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a login si no está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

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
