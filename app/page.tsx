'use client'

import { useState, FormEvent, useEffect, useMemo } from 'react'
import { RESTAURANTS } from './const/restaurants' // Import restaurants
import type { MinimalBookingAvailabilityResponse, MinimalService } from './types/api' // Import response types

// Helper function to get the next Saturday (or today if Saturday)
const getNextSaturday = (): string => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);

  // Format as YYYY-MM-DD
  const year = nextSaturday.getFullYear();
  const month = (nextSaturday.getMonth() + 1).toString().padStart(2, '0');
  const day = nextSaturday.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(RESTAURANTS[0]?.id || '') // Default to the first restaurant
  const [date, setDate] = useState<string>('') // Initialize empty
  const [numPeople, setNumPeople] = useState<number>(2) // Default to 2 people
  const [availability, setAvailability] = useState<MinimalBookingAvailabilityResponse | null>(null) // Use correct type
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null) // State for selected service filter

  // Set default date on initial render
  useEffect(() => {
    setDate(getNextSaturday());
  }, []);

  // Hardcoded venue ID for now - REMOVED
  // const venueId = '12345' // Replace with a real venue ID later

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAvailability(null)
    setSelectedService(null); // Reset selected service on new submit

    if (!selectedVenueId) {
      setError('Please select a restaurant.')
      setLoading(false)
      return
    }

    if (!date) {
        setError('Please select a date.');
        setLoading(false);
        return;
    }

    // Use selectedVenueId in the API call
    const apiUrl = `/api/getAvailability?venueId=${selectedVenueId}&date=${date}&numPeople=${numPeople}`

    try {
      const res = await fetch(apiUrl)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `API Error: ${res.status}`)
      }
      const data: MinimalBookingAvailabilityResponse = await res.json() // Type the parsed data
      setAvailability(data)
      // Set default filter after fetching data
      if (data?.services && data.services.length > 0) {
        // Prioritize 'Dinner', then the first available service
        const dinnerService = data.services.find(s => s.name.toLowerCase() === 'dinner');
        setSelectedService(dinnerService ? dinnerService.name : data.services[0].name);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  // Memoize unique service names for filter buttons
  const serviceNames = useMemo(() => {
    if (!availability?.services) return [];
    return [...new Set(availability.services.map(s => s.name))];
  }, [availability]);

  // Memoize filtered services based on selection
  const filteredServices = useMemo(() => {
    if (!availability?.services || !selectedService) return availability?.services || [];
    return availability.services.filter(s => s.name === selectedService);
  }, [availability, selectedService]);

  return (
    <main className="container mx-auto p-4 flex flex-col items-center min-h-screen bg-gray-900 text-gray-200">
      <h1 className="text-3xl font-bold mb-8 text-white">Restaurant Availability</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm mb-8 p-6 bg-gray-800 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-400 mb-1">
            Restaurant
          </label>
          <select
            id="venue"
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {RESTAURANTS.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            // Add dark mode styling for date input text color scheme
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:[color-scheme:dark]"
          />
        </div>

        <div>
          <label htmlFor="numPeople" className="block text-sm font-medium text-gray-400 mb-1">
            Number of People
          </label>
          <input
            type="number"
            id="numPeople"
            value={numPeople}
            onChange={(e) => setNumPeople(parseInt(e.target.value, 10) || 1)}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedVenueId || !date} // Ensure date is also selected
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Availability'}
        </button>
      </form>

      {loading && <div className="text-center text-gray-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>Loading...</div>}

      {error && <p className="text-center text-red-400 bg-red-900 bg-opacity-50 p-3 rounded-md w-full max-w-sm">Error: {error}</p>}

      {availability && (
         <div className="w-full max-w-md mt-4 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Available Times</h2>

          {/* Service Type Filters - Only show if more than one service type exists */}
          {serviceNames.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {serviceNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedService(name)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedService === name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Display Filtered Services */}
          {filteredServices && filteredServices.length > 0 ? (
             filteredServices.map((service: MinimalService) => (
              <div key={service.name} className="mb-4">
                {/* Only show service name if filters are NOT displayed OR if it's the only one */}
                {(serviceNames.length <= 1 || !selectedService) && (
                     <h3 className="text-lg font-medium mb-2 text-gray-300">{service.name}</h3>
                )}
                {service.times && service.times.length > 0 ? (
                  <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {service.times.map((slot) => (
                      <li key={slot.time} className="bg-green-700 bg-opacity-80 text-green-100 text-sm font-medium text-center py-1.5 px-2 rounded-md shadow-sm hover:bg-green-600 cursor-pointer transition-colors">
                        {slot.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No times available for {service.name}.</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No available time slots found for the selected date, party size, and service.</p>
          )}
        </div>
      )}
    </main>
  )
}
