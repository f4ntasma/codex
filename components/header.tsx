import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code2, Upload } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-foreground">UniProjects</span>
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
          <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Acerca de
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Iniciar Sesión
          </Button>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Subir Proyecto
          </Button>
        </div>
      </div>
    </header>
  )
}
