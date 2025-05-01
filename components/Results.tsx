'use client'

import { MinimalService } from '@/app/types/api'
import { useAvailability } from '@/app/contexts/AvailabilityContext'
import { useAvailabilityFilter } from '@/hooks/useFilter'
import { RESTAURANTS } from '@/app/const/restaurants'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { getCookie, setCookie } from 'cookies-next'; // Import cookie functions

const COOKIE_NAME = 'favoriteRestaurants';

// Helper function to get/set favorites
const getFavorites = (): string[] => {
  // Cookies can be read client-side without checking for window
  try {
    const favoritesCookie = getCookie(COOKIE_NAME); // Read from cookie
    // Ensure it's a string before parsing
    return favoritesCookie && typeof favoritesCookie === 'string' ? JSON.parse(favoritesCookie) : [];
  } catch (error) {
    console.error('Error reading favorites from cookie:', error);
    return []; // Return empty on error
  }
};

const toggleFavorite = (restaurantId: string) => {
  const currentFavorites = getFavorites();
  let updatedFavorites;
  if (currentFavorites.includes(restaurantId)) {
    updatedFavorites = currentFavorites.filter(id => id !== restaurantId);
  } else {
    updatedFavorites = [...currentFavorites, restaurantId];
  }
  // Set the cookie - works client-side
  setCookie(COOKIE_NAME, JSON.stringify(updatedFavorites), {
    // Optional: Add cookie options like path, expires, etc.
    // path: '/',
    // maxAge: 60 * 60 * 24 * 365, // 1 year
  });
};

export function AvailabilityResults() {
  const {
    isLoading,
    error,
    results: rawResults,
    date,
    numPeople,
    dinnerOnly,
    searchTerm
  } = useAvailability()

  const filteredResults = useAvailabilityFilter(rawResults, searchTerm, dinnerOnly)
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const handleToggleFavorite = (restaurantId: string) => {
    toggleFavorite(restaurantId);
    setFavorites(getFavorites()); // Re-fetch to update state
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
        Loading availability for {date}...
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center text-destructive bg-destructive/20 p-3 rounded-md w-full max-w-md mt-4">
        Error loading data: {error}
      </p>
    )
  }

  const hasFilteredResults = filteredResults.length > 0;

  // Sort results: favorites first
  const sortedResults = [...filteredResults].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.restaurantId);
    const bIsFavorite = favorites.includes(b.restaurantId);
    if (aIsFavorite && !bIsFavorite) return -1; // a comes first
    if (!aIsFavorite && bIsFavorite) return 1;  // b comes first
    return 0; // Keep original order if both are fav/not fav
  });

  return (
    <div className="w-full max-w-3xl mt-4 space-y-6">
      {!isLoading && !hasFilteredResults && (
        <h2 className="text-2xl font-semibold mb-4 text-center">
          No results match your filters.
        </h2>
      )}

      {!isLoading && !hasFilteredResults && (
        <p className="text-center text-muted-foreground">Try adjusting your search or filters.</p>
      )}

      {sortedResults.map(({ restaurantId, restaurantName, services, error: restaurantError }) => {
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
}

function AvailabilityResultCard({
  restaurantId,
  restaurantName,
  restaurantUrl,
  services,
  restaurantError,
  isFavorite,
  onToggleFavorite,
  dinnerOnly
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
      {restaurantError ? (
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
        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {service.times.map((slot) => {
            const isShared = slot.onlySharedTablesRemain;
            const slotClasses = isShared 
              ? 'bg-accent/90 text-accent-foreground hover:bg-accent' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
            return (
              <li 
                key={slot.time} 
                className={`text-sm font-medium text-center py-1.5 px-2 rounded-md shadow-sm ${slotClasses}`}
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
