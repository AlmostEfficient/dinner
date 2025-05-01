// hooks/useAvailabilityFilter.ts
import { useMemo } from 'react'
import type { RestaurantDinnerAvailability } from '@/app/types/availability'

export function useAvailabilityFilter(
  availability: RestaurantDinnerAvailability[],
  searchTerm: string,
  dinnerOnly: boolean
) {
  return useMemo(() => {
    let results = [...availability] // Create a new array to avoid mutations

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.trim().toLowerCase()
      results = results.filter(item =>
        item.restaurantName.toLowerCase().includes(lowerSearchTerm)
      )
    }

    if (dinnerOnly) {
      results = results.map(item => {
        if (!item.services) return { ...item, services: null }

        const dinnerServices = item.services.filter(service =>
          service.name.toLowerCase().includes('dinner') || 
          service.name.toLowerCase().includes('evening')
        )

        return dinnerServices.length > 0 || item.error
          ? { ...item, services: dinnerServices.length > 0 ? dinnerServices : null }
          : null
      }).filter((item): item is RestaurantDinnerAvailability => item !== null)
    }

    return results
  }, [availability, searchTerm, dinnerOnly])
}