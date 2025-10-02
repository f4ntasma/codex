import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Code2, Upload } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-5 hover:opacity-80 transition-opacity">
          <Image 
            src="/blacklog.jpg" 
            alt="UniProjects Logo" 
            width={250} 
            height={100}
            className="xD"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/proyectos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Proyectos
          </Link>
          <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Estudiantes
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Iniciar Sesión
          </Button>
          <Link href="/subir-proyecto">
            <Button size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Subir Proyecto
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
