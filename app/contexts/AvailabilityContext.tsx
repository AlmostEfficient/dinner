'use client'

import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { parseISO, isValid as isValidDateFns, format as formatDate, getDay } from 'date-fns'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const weekdaySlugs: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

  const computeNextWeekday = (targetDay: number) => {
    const today = new Date()
    const todayDay = getDay(today)
    let delta = (targetDay - todayDay + 7) % 7
    if (delta === 0) delta = 7 // never today; always the next occurrence
    const next = new Date(today)
    next.setDate(today.getDate() + delta)
    return formatDate(next, 'yyyy-MM-dd')
  }

  const getInitialDateFromUrl = () => {
    const slug = pathname?.slice(1).toLowerCase()
    if (slug && weekdaySlugs[slug] !== undefined) {
      return computeNextWeekday(weekdaySlugs[slug])
    }

    const queryDate = searchParams.get('date')
    if (queryDate) {
      const parsed = parseISO(queryDate)
      if (isValidDateFns(parsed)) {
        return queryDate
      }
    }
    return getNextSaturday()
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [date, setDate] = useState(getInitialDateFromUrl)
  const [numPeople, setNumPeople] = useState(() => {
    const param = searchParams.get('numPeople')
    const parsed = param ? parseInt(param, 10) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2
  })
  const [debouncedNumPeople, setDebouncedNumPeople] = useState<number>(() => {
    const param = searchParams.get('numPeople')
    const parsed = param ? parseInt(param, 10) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2
  })
  const [dinnerOnly, setDinnerOnly] = useState(true)
  const [results, setResults] = useState<RestaurantDinnerAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const STAGGER_DELAY_MS = 300
  const CACHE_TTL_MS = 5 * 60 * 1000
  const activeRequestIdRef = useRef(0)
  const activeAbortControllerRef = useRef<AbortController | null>(null)
  const availabilityCacheRef = useRef<
    Map<
      string,
      {
        timestamp: number
        result: RestaurantDinnerAvailability
      }
    >
  >(new Map())

  useEffect(() => {
    const slug = pathname?.slice(1).toLowerCase()
    const isWeekdaySlug = !!slug && weekdaySlugs[slug] !== undefined
    const slugDate = isWeekdaySlug ? computeNextWeekday(weekdaySlugs[slug]) : null

    const params = new URLSearchParams()
    const includeDate = !isWeekdaySlug || (slugDate && slugDate !== date)
    const includeNum = numPeople !== 2

    if (includeDate) params.set('date', date)
    if (includeNum) params.set('numPeople', numPeople.toString())

    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }, [date, numPeople, pathname, router])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedNumPeople(numPeople), 250)
    return () => clearTimeout(t)
  }, [numPeople])

  const [favorites, setFavorites] = useState<string[]>(() => getFavoritesFromCookie())

  const fetchSingleRestaurant = async (
    restaurant: typeof RESTAURANTS[0],
    signal: AbortSignal
  ): Promise<RestaurantDinnerAvailability | null> => {
    try {
      const cacheKey = `${restaurant.id}-${date}-${numPeople}`
      const cached = availabilityCacheRef.current.get(cacheKey)
      const now = Date.now()
      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return cached.result
      }

      const res = await fetch(
        `/api/getAvailability?venueId=${restaurant.id}&date=${date}&numPeople=${numPeople}`,
        { signal }
      )
      if (!res.ok) {
        throw new Error(`API Error ${res.status} for ${restaurant.name}`)
      }
      const data: MinimalBookingAvailabilityResponse = await res.json()

      const freshResult = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        services: data.services?.length ? data.services : null,
        error: null,
      }
      availabilityCacheRef.current.set(cacheKey, { timestamp: now, result: freshResult })
      return freshResult
    } catch (err) {
      if (signal.aborted) {
        return null
      }
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
    const requestId = activeRequestIdRef.current + 1
    activeRequestIdRef.current = requestId

    activeAbortControllerRef.current?.abort()
    const controller = new AbortController()
    activeAbortControllerRef.current = controller

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

    const [firstRestaurant, secondRestaurant, ...remainingRestaurants] = sortedRestaurants

    if (!firstRestaurant) {
      setIsLoading(false)
      return
    }

    try {
      const firstBatchPromises = [
        fetchSingleRestaurant(firstRestaurant, controller.signal),
        secondRestaurant ? fetchSingleRestaurant(secondRestaurant, controller.signal) : Promise.resolve(null)
      ]

      const firstBatchResults = await Promise.all(firstBatchPromises)
      if (activeRequestIdRef.current !== requestId) return

      const seeded = firstBatchResults.filter((r): r is RestaurantDinnerAvailability => !!r)
      setResults(seeded)

      for (const restaurant of remainingRestaurants) {
        if (activeRequestIdRef.current !== requestId) break
        await sleep(STAGGER_DELAY_MS)
        if (activeRequestIdRef.current !== requestId) break

        const result = await fetchSingleRestaurant(restaurant, controller.signal)
        if (!result || activeRequestIdRef.current !== requestId) continue

        setResults(prevResults => [...prevResults, result])
      }

      if (activeRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    } catch (err) {
      console.error("An unexpected error occurred during fetchAvailability:", err)
      if (activeRequestIdRef.current === requestId) {
        setError('An unexpected error occurred while fetching availability.')
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, debouncedNumPeople])

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