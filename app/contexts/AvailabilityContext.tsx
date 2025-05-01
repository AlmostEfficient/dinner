'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { RestaurantDinnerAvailability } from '@/app/types/availability'
import { RESTAURANTS } from '@/app/const/restaurants'
import { MinimalBookingAvailabilityResponse } from '@/app/types/api'
import { getNextSaturday, sleep } from '@/lib/utils'
import { getCookie } from 'cookies-next'

const COOKIE_NAME = 'favoriteRestaurants'

const getFavoritesFromCookie = (): string[] => {
  try {
    const favoritesCookie = getCookie(COOKIE_NAME)
    return favoritesCookie && typeof favoritesCookie === 'string' ? JSON.parse(favoritesCookie) : []
  } catch (error) {
    console.error('Error reading favorites from cookie in context:', error)
    return []
  }
}

interface AvailabilityContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  date: string
  setDate: (date: string) => void
  numPeople: number
  setNumPeople: (num: number) => void
  dinnerOnly: boolean
  setDinnerOnly: (isDinner: boolean) => void
  isLoading: boolean
  error: string | null
  results: RestaurantDinnerAvailability[]
  fetchAvailability: () => Promise<void>
}

const AvailabilityContext = createContext<AvailabilityContextType | null>(null)

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [date, setDate] = useState(getNextSaturday())
  const [numPeople, setNumPeople] = useState(2)
  const [dinnerOnly, setDinnerOnly] = useState(true)
  const [results, setResults] = useState<RestaurantDinnerAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const STAGGER_DELAY_MS = 500

  const [favorites, setFavorites] = useState<string[]>(() => getFavoritesFromCookie())

  const fetchSingleRestaurant = async (restaurant: typeof RESTAURANTS[0]): Promise<RestaurantDinnerAvailability> => {
    try {
      const res = await fetch(
        `/api/getAvailability?venueId=${restaurant.id}&date=${date}&numPeople=${numPeople}`
      )
      if (!res.ok) {
        throw new Error(`API Error ${res.status} for ${restaurant.name}`)
      }
      const data: MinimalBookingAvailabilityResponse = await res.json()

      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        services: data.services?.length ? data.services : null,
        error: null,
      }
    } catch (err) {
      console.error(`Failed to fetch ${restaurant.name}:`, err)
      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        services: null,
        error: err instanceof Error ? err.message : 'Unknown fetch error',
      }
    }
  }

  const fetchAvailability = async () => {
    setIsLoading(true)
    setError(null)
    setResults([])

    const currentFavorites = getFavoritesFromCookie()
    setFavorites(currentFavorites)

    const sortedRestaurants = [...RESTAURANTS].sort((a, b) => {
      const aIsFavorite = currentFavorites.includes(a.id)
      const bIsFavorite = currentFavorites.includes(b.id)
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      return 0
    })

    const [firstRestaurant, ...remainingRestaurants] = sortedRestaurants

    if (!firstRestaurant) {
      setIsLoading(false)
      return
    }

    try {
      const firstResult = await fetchSingleRestaurant(firstRestaurant)
      setResults([firstResult])
      setIsLoading(false)

      for (const restaurant of remainingRestaurants) {
        await sleep(STAGGER_DELAY_MS)
        const result = await fetchSingleRestaurant(restaurant)
        setResults(prevResults => [...prevResults, result])
      }

    } catch (err) {
      console.error("An unexpected error occurred during fetchAvailability:", err)
      setError('An unexpected error occurred while fetching availability.')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, numPeople])

  return (
    <AvailabilityContext.Provider 
      value={{
        searchTerm,
        setSearchTerm,
        date,
        setDate,
        numPeople,
        setNumPeople,
        dinnerOnly,
        setDinnerOnly,
        isLoading,
        error,
        results,
        fetchAvailability
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  )
}

export function useAvailability() {
  const context = useContext(AvailabilityContext)
  if (!context) {
    throw new Error('useAvailability must be used within an AvailabilityProvider')
  }
  return context
} 