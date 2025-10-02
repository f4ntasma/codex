// Componente Toast para mostrar notificaciones
// Proporciona feedback visual para acciones del usuario

'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from './button'
import type { Toast, ToastType } from '@/lib/hooks/use-toast'

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

// Configuración de iconos y estilos para cada tipo de toast
const toastConfig: Record<ToastType, {
  icon: React.ComponentType<{ className?: string }>
  className: string
  iconColor: string
}> = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600'
  }
}

// Componente individual de toast
export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const config = toastConfig[toast.type]
  const Icon = config.icon

  // Auto-dismiss después del tiempo especificado
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div className={`
      relative flex items-start gap-3 p-4 rounded-lg border shadow-lg
      animate-in slide-in-from-right-full duration-300
      ${config.className}
    `}>
      {/* Icono del tipo de toast */}
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
      
      {/* Contenido del toast */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.description && (
          <p className="text-sm opacity-90 mt-1">{toast.description}</p>
        )}
      </div>

      {/* Botón para cerrar */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-black/10"
        onClick={() => onDismiss(toast.id)}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Barra de progreso para mostrar tiempo restante */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 animate-[shrink_var(--duration)_linear_forwards]"
            style={{ '--duration': `${toast.duration}ms` } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  )
}

// Contenedor de toasts que se posiciona en la esquina de la pantalla
interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

// Estilos CSS adicionales para las animaciones (agregar a globals.css)
export const toastStyles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`
