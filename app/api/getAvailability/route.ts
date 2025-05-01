import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import * as types from '@/app/types/api'
import type { ExternalBookingAvailabilityResponse, ExternalService, TimeSlot as ExternalTimeSlot, TimeSlotSection } from '@/app/types/api'

// Helper function to normalize a single service
function normalizeExternalService(externalService: ExternalService): types.MinimalService | null {
  const minimalTimes: types.MinimalTimeSlot[] = [];

  if (externalService.times) {
    externalService.times.forEach((timeSlot: ExternalTimeSlot) => {
      // Determine availability based on sections if they exist
      let isAvailableBasedOnSections = true; // Default to true if no sections array
      if (timeSlot.sections && timeSlot.sections.length > 0) {
        isAvailableBasedOnSections = timeSlot.sections.some(
          (section: TimeSlotSection) => section.sectionState === true && section.isSectionBlocked === false
        );
      }

      // A slot is blocked if the API says so directly OR if sections exist and none are available
      const isEffectivelyBlocked = timeSlot.isBlockOut || (timeSlot.sections && timeSlot.sections.length > 0 && !isAvailableBasedOnSections);

      // Only add the timeslot if it's NOT effectively blocked
      if (!isEffectivelyBlocked) {
        minimalTimes.push({
          name: timeSlot.name,
          time: timeSlot.time,
          isBlockOut: false, // We only include non-blocked slots, so this is always false here
          onlySharedTablesRemain: timeSlot.onlySharedTablesRemain, // Pass this through
        });
      }
    });
  }

  // Only return the service if it has available times after normalization
  if (minimalTimes.length > 0) {
    return {
      name: externalService.name,
      times: minimalTimes,
    };
  }

  return null; // Return null if no available times for this service
}

// Define mock data
const mockAvailabilityData: types.MinimalBookingAvailabilityResponse = {
  services: [
    {
      name: "Mock Dinner Service",
      times: [
        { name: "6:00 PM", time: "18:00", isBlockOut: false, onlySharedTablesRemain: false },
        { name: "6:30 PM", time: "18:30", isBlockOut: false, onlySharedTablesRemain: false },
        { name: "7:00 PM", time: "19:00", isBlockOut: false, onlySharedTablesRemain: true },
      ],
    },
    {
      name: "Mock Late Night",
      times: [
        { name: "9:00 PM", time: "21:00", isBlockOut: false, onlySharedTablesRemain: false },
        { name: "9:30 PM", time: "21:30", isBlockOut: false, onlySharedTablesRemain: false },
      ],
    },
  ],
};

export async function GET(request: NextRequest) {
  // Check for mock API flag
  if (process.env.MOCK_API_ENABLED === 'true') {
    console.log('[API /getAvailability] Returning MOCK data.');
    // Simulate a short delay for mock responses if needed
    // await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json(mockAvailabilityData, { status: 200 });
  }

  const { searchParams } = new URL(request.url)
  const venueId = searchParams.get('venueId')
  const date = searchParams.get('date') // Expected format: YYYY-MM-DD
  const numPeople = searchParams.get('numPeople')

  if (!venueId || !date || !numPeople) {
    return NextResponse.json(
      { error: 'Missing required query parameters: venueId, date, numPeople' },
      { status: 400 }
    )
  }

  // Basic validation (more robust validation can be added)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }
  const people = parseInt(numPeople, 10);
  if (isNaN(people) || people < 1) {
      return NextResponse.json({ error: 'Invalid number of people.' }, { status: 400 });
  }


  const targetUrl = `https://api.nowbookit.com/bookings/get-schedule/venue/${venueId}?date=${date}&numofpeople=${numPeople}`
  const correlationId = crypto.randomUUID()

  const headers = new Headers({
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://bookings.nowbookit.com',
    'Referer': 'https://bookings.nowbookit.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'X-NBI-Source': 'widget2',
    'X-NBI-CorrelationId': correlationId,
  })

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
      // You might need to configure caching behavior if Next.js aggressively caches
      // cache: 'no-store',
      next: { revalidate: 4 }
    })

    if (!response.ok) {
      console.error(`External API Error: ${response.status} ${response.statusText}`)
      // Try to parse error from external API if available
      let errorBody = 'Failed to fetch availability'
      try {
        const errJson = await response.json()
        errorBody = errJson.message || errJson.error || errorBody
      } catch (parseError) {
        // Ignore if error body isn't JSON
      }
      return NextResponse.json({ error: errorBody }, { status: response.status })
    }

    const externalData: ExternalBookingAvailabilityResponse = await response.json();
    // console.log('[API /getAvailability] Raw External Data:', JSON.stringify(externalData, null, 2)); // Keep for debugging if needed

    // Process the data using the normalization function
    const minimalServices: types.MinimalService[] = [];
    if (externalData && externalData.services) {
      externalData.services.forEach((service: ExternalService) => {
        const normalizedService = normalizeExternalService(service);
        if (normalizedService) {
          minimalServices.push(normalizedService);
        }
      });
    }

    const processedData: types.MinimalBookingAvailabilityResponse = {
        services: minimalServices
    };

    // console.log('[API /getAvailability] Processed Data Sent to Frontend:', JSON.stringify(processedData, null, 2)); // Keep for debugging if needed

    return NextResponse.json(processedData, { status: 200 })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 