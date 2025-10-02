// Hook personalizado para implementar debounce en búsquedas
// Evita hacer demasiadas consultas mientras el usuario está escribiendo

import { useState, useEffect } from 'react'

/**
 * Hook que retrasa la actualización de un valor hasta que haya pasado un tiempo sin cambios
 * Útil para búsquedas en tiempo real para evitar hacer demasiadas consultas a la API
 * 
 * @param value - El valor que queremos "debounce"
 * @param delay - El tiempo de espera en milisegundos (por defecto 300ms)
 * @returns El valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Crear un timer que actualizará el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timer si el valor cambia antes de que se complete
    // Esto es lo que crea el efecto "debounce"
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook especializado para búsquedas que combina debounce con validación de longitud mínima
 * 
 * @param searchTerm - El término de búsqueda
 * @param minLength - Longitud mínima para activar la búsqueda (por defecto 2)
 * @param delay - Tiempo de espera en milisegundos (por defecto 300ms)
 * @returns Objeto con el término procesado y estado de si debe buscar
 */
export function useSearchDebounce(
  searchTerm: string, 
  minLength: number = 2, 
  delay: number = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm, delay)
  
  return {
    searchTerm: debouncedSearchTerm,
    shouldSearch: debouncedSearchTerm.length >= minLength,
    isSearching: searchTerm !== debouncedSearchTerm && searchTerm.length >= minLength
  }
}
