import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo - en producción vendrían de una base de datos
const allProjects = [
  {
    id: 1,
    title: "Sistema de Gestión Académica",
    description:
      "Plataforma web completa para gestionar calificaciones, asistencias y horarios de estudiantes universitarios.",
    author: "María González",
    authorAvatar: "/diverse-students-studying.png",
    tags: ["React", "Node.js", "MongoDB"],
    stars: 45,
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "App de Realidad Aumentada",
    description: "Aplicación móvil que utiliza AR para visualizar modelos 3D de anatomía humana con fines educativos.",
    author: "Carlos Ramírez",
    authorAvatar: "/developer-working.png",
    tags: ["Unity", "C#", "ARCore"],
    stars: 67,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Chatbot con IA",
    description:
      "Asistente virtual inteligente para responder preguntas frecuentes de estudiantes sobre trámites universitarios.",
    author: "Ana Martínez",
    authorAvatar: "/female-student.jpg",
    tags: ["Python", "TensorFlow", "NLP"],
    stars: 89,
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "E-commerce Sostenible",
    description: "Marketplace para productos ecológicos con sistema de puntos por compras sustentables.",
    author: "Luis Torres",
    authorAvatar: "/male-student.jpg",
    tags: ["Next.js", "Stripe", "PostgreSQL"],
    stars: 52,
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Plataforma de Tutorías",
    description:
      "Sistema de conexión entre estudiantes y tutores con videollamadas integradas y calendario compartido.",
    author: "Sofia Hernández",
    authorAvatar: "/tutor-session.png",
    tags: ["Vue.js", "WebRTC", "Firebase"],
    stars: 73,
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Juego Educativo de Matemáticas",
    description: "Juego interactivo para aprender álgebra y geometría de forma divertida con niveles progresivos.",
    author: "Diego Vargas",
    authorAvatar: "/game-developer.jpg",
    tags: ["Phaser", "JavaScript", "Canvas"],
    stars: 41,
    image: "/placeholder.svg",
  },
  {
    id: 7,
    title: "Red Social Universitaria",
    description: "Plataforma social exclusiva para estudiantes con grupos de estudio, eventos y foros de discusión.",
    author: "Valentina Ruiz",
    authorAvatar: "/social-media-user.jpg",
    tags: ["React Native", "GraphQL", "AWS"],
    stars: 95,
    image: "/placeholder.svg",
  },
  {
    id: 8,
    title: "Sistema de Biblioteca Digital",
    description: "Repositorio digital con búsqueda avanzada, préstamos virtuales y recomendaciones personalizadas.",
    author: "Roberto Sánchez",
    authorAvatar: "/librarian.png",
    tags: ["Django", "Elasticsearch", "Docker"],
    stars: 58,
    image: "/placeholder.svg",
  },
  {
    id: 9,
    title: "App de Salud Mental",
    description:
      "Aplicación para el bienestar estudiantil con meditaciones guiadas, seguimiento de ánimo y recursos de apoyo.",
    author: "Camila López",
    authorAvatar: "/wellness-coach.jpg",
    tags: ["Flutter", "Dart", "Supabase"],
    stars: 82,
    image: "/placeholder.svg",
  },
  {
    id: 10,
    title: "Simulador de Física",
    description: "Herramienta interactiva para simular experimentos de física con visualizaciones en tiempo real.",
    author: "Andrés Morales",
    authorAvatar: "/physics-student.jpg",
    tags: ["Three.js", "WebGL", "TypeScript"],
    stars: 64,
    image: "/placeholder.svg",
  },
  {
    id: 11,
    title: "Gestor de Proyectos Colaborativos",
    description: "Plataforma tipo Trello para equipos estudiantiles con tableros Kanban y chat integrado.",
    author: "Patricia Jiménez",
    authorAvatar: "/project-manager.jpg",
    tags: ["Svelte", "Socket.io", "Redis"],
    stars: 71,
    image: "/placeholder.svg",
  },
  {
    id: 12,
    title: "Traductor de Lenguaje de Señas",
    description: "Sistema de reconocimiento de gestos que traduce lenguaje de señas a texto en tiempo real.",
    author: "Fernando Castro",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["OpenCV", "Python", "ML"],
    stars: 103,
    image: "/placeholder.svg",
  },
  {
    id: 13,
    title: "Plataforma de Crowdfunding",
    description: "Sistema para financiar proyectos estudiantiles mediante donaciones y recompensas.",
    author: "Isabella Rojas",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Laravel", "PayPal", "MySQL"],
    stars: 49,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 14,
    title: "Sistema de Reconocimiento Facial",
    description: "Control de asistencia automatizado mediante reconocimiento facial con deep learning.",
    author: "Miguel Ángel Pérez",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["PyTorch", "FastAPI", "OpenCV"],
    stars: 87,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 15,
    title: "App de Carpooling Universitario",
    description: "Aplicación para compartir viajes entre estudiantes con rutas optimizadas y sistema de valoraciones.",
    author: "Daniela Ortiz",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["React Native", "Google Maps", "Node.js"],
    stars: 56,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 16,
    title: "Generador de Horarios Inteligente",
    description: "Algoritmo que genera horarios académicos óptimos evitando conflictos y maximizando preferencias.",
    author: "Sebastián Díaz",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Java", "Genetic Algorithms", "Spring"],
    stars: 62,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 17,
    title: "Marketplace de Apuntes",
    description: "Plataforma para comprar y vender apuntes universitarios verificados por calidad.",
    author: "Gabriela Mendoza",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Angular", "Stripe", "MongoDB"],
    stars: 44,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 18,
    title: "Sistema de Votación Electrónica",
    description: "Plataforma segura para elecciones estudiantiles con blockchain y verificación de identidad.",
    author: "Alejandro Silva",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Solidity", "Ethereum", "Web3.js"],
    stars: 78,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 19,
    title: "App de Recetas Estudiantiles",
    description: "Recetario colaborativo con recetas económicas y rápidas para estudiantes con presupuesto limitado.",
    author: "Carolina Vega",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Ionic", "Firebase", "Angular"],
    stars: 51,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 20,
    title: "Simulador de Circuitos Eléctricos",
    description: "Herramienta web para diseñar y simular circuitos eléctricos con análisis de corriente y voltaje.",
    author: "Ricardo Flores",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["JavaScript", "Canvas", "Physics Engine"],
    stars: 69,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 21,
    title: "Plataforma de Intercambio de Libros",
    description: "Sistema para intercambiar libros usados entre estudiantes con sistema de puntos.",
    author: "Natalia Romero",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Ruby on Rails", "PostgreSQL", "Bootstrap"],
    stars: 38,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 22,
    title: "Dashboard de Análisis de Datos",
    description:
      "Herramienta de visualización de datos académicos con gráficos interactivos y reportes personalizados.",
    author: "Javier Gutiérrez",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["D3.js", "React", "Express"],
    stars: 75,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 23,
    title: "App de Gestión de Gastos",
    description: "Aplicación para controlar gastos mensuales con categorías, presupuestos y alertas.",
    author: "Lucía Navarro",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Swift", "CoreData", "Charts"],
    stars: 47,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 24,
    title: "Sistema de Reserva de Espacios",
    description: "Plataforma para reservar salas de estudio, laboratorios y auditorios universitarios.",
    author: "Tomás Herrera",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["PHP", "MySQL", "jQuery"],
    stars: 53,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 25,
    title: "Juego de Programación Competitiva",
    description: "Plataforma de desafíos de código con rankings, torneos y problemas de algoritmos.",
    author: "Martín Campos",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Go", "Docker", "Kubernetes"],
    stars: 91,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 26,
    title: "App de Meditación Guiada",
    description: "Aplicación con sesiones de meditación para reducir el estrés académico.",
    author: "Elena Paredes",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["Kotlin", "Android", "ExoPlayer"],
    stars: 59,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 27,
    title: "Sistema de Gestión de Inventario",
    description: "Software para controlar inventario de laboratorios con códigos QR y alertas de stock.",
    author: "Pablo Reyes",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["ASP.NET", "SQL Server", "Blazor"],
    stars: 42,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 28,
    title: "Plataforma de Podcasts Educativos",
    description: "Servicio de streaming de podcasts creados por estudiantes sobre diversos temas académicos.",
    author: "Andrea Molina",
    authorAvatar: "/perfilpe.jpg?height=40&width=40",
    tags: ["Nuxt.js", "Cloudflare", "Tailwind"],
    stars: 66,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 29,
    title: "Generador de Citas Bibliográficas",
    description: "Herramienta automática para generar citas en formato APA, MLA, Chicago y más.",
    author: "Francisco Delgado",
    authorAvatar: "/perfilpe.jpg?height=40&width=40",
    tags: ["Vue.js", "Vite", "Pinia"],
    stars: 54,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 30,
    title: "App de Networking Estudiantil",
    description: "Red profesional para conectar estudiantes con empresas y oportunidades de prácticas.",
    author: "Mariana Cruz",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["React", "GraphQL", "Prisma"],
    stars: 84,
    image: "/placeholder.svg?height=300&width=400",
  },
]

interface ProjectGridProps {
  limit: number | null
  showViewMore: boolean
}

export function ProjectGrid({ limit, showViewMore }: ProjectGridProps) {
  const displayedProjects = limit ? allProjects.slice(0, limit) : allProjects

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {limit ? "Proyectos Destacados" : "Todos los Proyectos"}
        </h2>
        <p className="text-muted-foreground">
          {limit
            ? "Descubre los proyectos más populares de nuestra comunidad"
            : `${allProjects.length} proyectos disponibles`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {showViewMore && (
        <div className="mt-12 text-center">
          <Link href="/proyectos">
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              Ver Todos los Proyectos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
