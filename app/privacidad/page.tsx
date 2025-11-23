export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Política de Privacidad</h1>
          <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-foreground">
          <p>En Syma nos comprometemos a proteger tu información personal. Esta política explica qué datos recopilamos, por qué y cómo los usamos.</p>

          <h2 className="text-lg font-semibold">Datos que recopilamos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Cuenta: nombre, correo, rol (estudiante/empresa/admin).</li>
            <li>Contenido: proyectos, comentarios, likes y archivos que subas.</li>
            <li>Uso: métricas básicas de uso de la plataforma (vistas y navegación).</li>
          </ul>

          <h2 className="text-lg font-semibold">Para qué usamos tus datos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Operar la plataforma (mostrar proyectos, likes, comentarios, contratación).</li>
            <li>Mejorar la experiencia y seguridad.</li>
            <li>Comunicaciones relacionadas con tu cuenta y notificaciones transaccionales.</li>
          </ul>

          <h2 className="text-lg font-semibold">Bases legales</h2>
          <p>Interés legítimo en operar el servicio y, cuando aplique, tu consentimiento (por ejemplo, para cookies o marketing).</p>

          <h2 className="text-lg font-semibold">Con quién compartimos</h2>
          <p>Proveedores esenciales (hosting, bases de datos, autenticación). No vendemos tus datos.</p>

          <h2 className="text-lg font-semibold">Retención</h2>
          <p>Mantenemos tus datos mientras tengas cuenta activa o sea necesario para prestar el servicio. Puedes solicitar eliminación.</p>

          <h2 className="text-lg font-semibold">Tus derechos</h2>
          <p>Acceso, rectificación, eliminación, limitación u oposición al tratamiento. Escríbenos para ejercerlos.</p>

          <h2 className="text-lg font-semibold">Contacto</h2>
          <p>Para dudas o solicitudes de privacidad contáctanos en soporte@syma.app.</p>
        </section>
      </div>
    </main>
  )
}
