'use client'

import { MinimalService } from '@/app/types/api'
import { useAvailability } from '@/app/contexts/AvailabilityContext'
import { useAvailabilityFilter } from '@/hooks/useFilter'
import { RESTAURANTS } from '@/app/const/restaurants'
import { Heart } from 'lucide-react'
import { useMemo } from 'react'
import { isSameDay, format, parseISO } from 'date-fns'
import type { RestaurantDinnerAvailability } from '@/app/types/availability'

type PendingAvailability = RestaurantDinnerAvailability & { isPending?: boolean }

export function AvailabilityResults() {
  const {
    isLoading,
    error,
    results: rawResults,
    date,
    numPeople,
    dinnerOnly,
    searchTerm,
    favorites,
    toggleFavorite
  } = useAvailability()

  const filteredResults = useAvailabilityFilter(rawResults, searchTerm, dinnerOnly)
  const parsedDate = useMemo(() => {
    const next = parseISO(date)
    return isNaN(next.getTime()) ? new Date() : next
  }, [date])

  const handleToggleFavorite = (restaurantId: string) => {
    toggleFavorite(restaurantId)
  }

  const sortedRestaurants = useMemo(() => {
    return [...RESTAURANTS].sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id)
      const bIsFavorite = favorites.includes(b.id)
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      return 0
    })
  }, [favorites])

  const mergedResults = useMemo(() => {
    const includePending = isLoading && rawResults.length > 0
    const map = new Map(rawResults.map(r => [r.restaurantId, r]))

    if (!includePending) {
      return rawResults as PendingAvailability[]
    }

    return sortedRestaurants.map(r => {
      const existing = map.get(r.id)
      if (existing) return existing
      return {
        restaurantId: r.id,
        restaurantName: r.name,
        services: null,
        error: null,
        isPending: true,
      } as const
    }) as PendingAvailability[]
  }, [isLoading, rawResults, sortedRestaurants])

  const filteredMergedResults = useAvailabilityFilter(
    mergedResults as RestaurantDinnerAvailability[],
    searchTerm,
    dinnerOnly
  ) as PendingAvailability[]

  if (error) {
    return (
      <p className="text-center text-destructive bg-destructive/20 p-3 rounded-md w-full max-w-md mt-4">
        Error loading data: {error}
      </p>
    )
  }

  const hasFilteredResults = filteredMergedResults.length > 0;
  const isSearching = searchTerm.trim().length > 0;
  const showSearchLoading = isLoading && isSearching && !hasFilteredResults;

  // Sort results: favorites first
  const sortedResults = [...filteredMergedResults].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.restaurantId);
    const bIsFavorite = favorites.includes(b.restaurantId);
    if (aIsFavorite && !bIsFavorite) return -1; // a comes first
    if (!aIsFavorite && bIsFavorite) return 1;  // b comes first
    return 0; // Keep original order if both are fav/not fav
  });

  return (
    <div className="w-full max-w-3xl space-y-6">
  
        {hasFilteredResults && (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">
              {dinnerOnly ? 'dinner ' : 'food '} 
              for {numPeople},{' '}
            {isSameDay(parsedDate, new Date())
              ? `today, ${format(parsedDate, 'EEEE, MMMM d')}`
              : format(parsedDate, 'eeee, MMMM d').toLowerCase()}
            </h3>
          </div>
        )}
      
      {showSearchLoading && (
        <div className="flex items-center justify-center text-muted-foreground gap-2">
          <div className="h-3 w-3 rounded-full border-b-2 border-primary animate-spin" />
          lemme see...
        </div>
      )}

      {!isLoading && !hasFilteredResults && (
        <h2 className="text-2xl font-semibold mb-4 text-center">
          i don't have that one yet 😭
        </h2>
      )}

      {!isLoading && !hasFilteredResults && (
        <>
        <p className="text-center text-muted-foreground">
          <a href="https://instagram.com/ab_raza" className="underline">get dinner w/ me</a> there and maybe i'll add it
        </p>
        </>

      )}

      {sortedResults.map(({ restaurantId, restaurantName, services, error: restaurantError, isPending }) => {
        const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
        const isFavorite = favorites.includes(restaurantId);

        return (
          <AvailabilityResultCard
            key={restaurantId}
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            restaurantUrl={restaurant?.url === null ? undefined : restaurant?.url}
            services={services}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            dinnerOnly={dinnerOnly}
          />
        )
      })}
    </div>
  )
}

interface AvailabilityResultCardProps {
  restaurantId: string;
  restaurantName: string;
  restaurantUrl?: string;
  services: MinimalService[] | null;
  restaurantError?: string;
  isFavorite: boolean;
  onToggleFavorite: (restaurantId: string) => void;
  dinnerOnly: boolean;
  isPending?: boolean;
}

function AvailabilityResultCard({
  restaurantId,
  restaurantName,
  restaurantUrl,
  services,
  restaurantError,
  isFavorite,
  onToggleFavorite,
  dinnerOnly,
  isPending
}: AvailabilityResultCardProps) {

  const handleStarClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation(); // Prevent card click when clicking star
    e.preventDefault(); // Prevent default link behavior if any
    onToggleFavorite(restaurantId);
  };

  const CardContent = () => (
    <div className="p-4 rounded-lg bg-card shadow-md space-y-3 relative">
      <Heart
        onClick={handleStarClick}
        className={`absolute top-3 right-3 h-5 w-5 cursor-pointer ${isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`}
      />
      <h3 className="text-xl font-medium mb-3 pr-8">{restaurantName}</h3>
      {isPending ? (
        <p className="text-sm text-muted-foreground italic flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-b-2 border-primary animate-spin" />
          loading availability...
        </p>
      ) : restaurantError ? (
        <p className="text-sm text-destructive italic">Error: {restaurantError}</p>
      ) : services && services.length > 0 ? (
        <div className="space-y-3">
          {services.map((service: MinimalService) => (
            <ServiceTimes key={service.name} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No matching availability found for this date/party size{dinnerOnly ? ' (Dinner Only)' : ''}.</p>
      )}
    </div>
  );

  if (restaurantUrl) {
    return (
      <a href={restaurantUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
        <CardContent />
      </a>
    );
  } else {
    return <CardContent />;
  }
}

// Sub-component for service times
function ServiceTimes({ service }: { service: MinimalService }) {
  return (
    <div>
      <h4 className="text-md font-medium mb-1.5">{service.name}</h4>
      {service.times && service.times.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {service.times.map((slot) => {
            const isShared = slot.onlySharedTablesRemain;
            const slotClasses = isShared 
              ? 'bg-accent/90 text-accent-foreground hover:bg-accent' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
            return (
              <li 
                key={slot.time} 
                className={`text-sm font-medium text-center py-1.5 px-3 rounded-md shadow-sm ${slotClasses}`}
                title={isShared ? 'Shared table only' : ''}
              >
                {slot.name}{isShared ? '*' : ''}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">No times available for {service.name}.</p>
      )}
    </div>
  )
}
