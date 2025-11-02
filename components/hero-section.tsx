import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Plataforma de Proyectos Universitarios Para Mejorar El Mundo
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Comparte y Descubre Proyectos Increíbles
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
          Una plataforma donde estudiantes pueden mostrar sus proyectos, colaborar con otros y construir su portafolio
          profesional.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            Explorar Proyectos
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
            Subir tu Proyecto
          </Button>
        </div>
      </div>
    </section>
  )
}
