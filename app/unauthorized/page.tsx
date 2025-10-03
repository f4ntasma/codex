'use client'

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Acceso No Autorizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                No tienes permisos para acceder a esta sección. Tu rol actual no está autorizado para ver este contenido.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Roles y Permisos:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Estudiantes:</strong> Acceso a perfil estudiantil y proyectos</li>
                  <li>• <strong>Intercorp:</strong> Acceso a proyectos y funciones de contratación</li>
                  <li>• <strong>Administrador:</strong> Acceso completo al sistema</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Login
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="gap-2">
                    <Home className="h-4 w-4" />
                    Ir al Inicio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
