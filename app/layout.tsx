import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hackaton Unix - Proyectos Estudiantiles',
  description: 'Plataforma de proyectos estudiantiles universitarios - Descubre, comparte y colabora en proyectos innovadores',
  generator: 'Next.js',
  icons: {
    icon: '/logitoutp.png',
    shortcut: '/logitoutp.png',
    apple: '/logitoutp.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
