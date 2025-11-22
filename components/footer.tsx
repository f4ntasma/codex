import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted text-muted-foreground mt-auto border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Syma</h3>
            <p className="text-sm">
              Una plataforma para que estudiantes universitarios compartan sus proyectos y conecten con oportunidades profesionales.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/politicas" className="hover:text-primary hover:underline">
                  Políticas de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary hover:underline">
                  Términos y Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Twitter className="h-5 w-5" /></a>
              <a href="https://github.com/f4ntasma" target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Github className="h-5 w-5" /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-4 text-center text-sm">
          <p>&copy; {currentYear} Syma. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}