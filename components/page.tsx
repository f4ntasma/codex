import { Header } from "@/components/header";

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
          <h1>Términos y Política de Cookies</h1>
          <p>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2>1. Términos de Servicio</h2>
          <p>
            Al acceder y utilizar Syma, aceptas cumplir y estar sujeto a los siguientes términos y condiciones de uso, que junto con nuestra política de privacidad rigen la relación de Syma contigo en relación a este sitio web.
          </p>

          <h2>2. Política de Cookies</h2>
          <p>
            Nuestro sitio web utiliza cookies para distinguirte de otros usuarios de nuestro sitio web. Esto nos ayuda a proporcionarte una buena experiencia cuando navegas por nuestro sitio web y también nos permite mejorarlo.
          </p>

          {/* Agrega más secciones según sea necesario */}
          <h2>3. Tipos de Cookies que Utilizamos</h2>
          <p>...</p>
        </div>
      </main>
    </div>
  );
}