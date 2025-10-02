// Hook personalizado para mostrar notificaciones toast
// Proporciona una forma simple de mostrar mensajes de éxito, error, etc.

import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

// Hook principal para manejar toasts
export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  // Función para agregar un nuevo toast
  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // 5 segundos por defecto
    }

    setState((prevState) => ({
      toasts: [...prevState.toasts, newToast],
    }))

    // Auto-remover el toast después del tiempo especificado
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }

    return id
  }, [])

  // Función para remover un toast específico
  const dismiss = useCallback((toastId: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((t) => t.id !== toastId),
    }))
  }, [])

  // Función para limpiar todos los toasts
  const dismissAll = useCallback(() => {
    setState({ toasts: [] })
  }, [])

  // Funciones de conveniencia para diferentes tipos de toast
  const success = useCallback((title: string, description?: string) => {
    return toast({ type: 'success', title, description })
  }, [toast])

  const error = useCallback((title: string, description?: string) => {
    return toast({ type: 'error', title, description, duration: 7000 }) // Errores duran más
  }, [toast])

  const warning = useCallback((title: string, description?: string) => {
    return toast({ type: 'warning', title, description })
  }, [toast])

  const info = useCallback((title: string, description?: string) => {
    return toast({ type: 'info', title, description })
  }, [toast])

  return {
    toasts: state.toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  }
}
