import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import * as types from '@/app/types/api'
import type { ExternalBookingAvailabilityResponse, ExternalService, TimeSlot as ExternalTimeSlot } from '@/app/types/api'

export async function GET(request: NextRequest) {
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
      cache: 'no-store',
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
    console.log('[API /getAvailability] Raw External Data:', JSON.stringify(externalData, null, 2)); // Log raw data

    // Process the data to extract only available time slots in the minimal format
    const processedData: types.MinimalBookingAvailabilityResponse = {
        services: []
    };

    if (externalData && externalData.services) {
        externalData.services.forEach((service: ExternalService) => {
            const availableTimes: types.MinimalTimeSlot[] = [];
            if (service.times) {
                service.times.forEach((timeSlot: ExternalTimeSlot) => {
                    // A time slot is considered potentially available if it is not blocked out.
                    // We are ignoring bookingOptionsCount for now as it seems unreliable.
                    if (!timeSlot.isBlockOut) {
                        availableTimes.push({
                            name: timeSlot.name,
                            time: timeSlot.time,
                            isBlockOut: false // Explicitly set based on our filter
                        });
                    }
                });
            }

            // Only include services that have available times
            if (availableTimes.length > 0) {
                 processedData.services.push({
                    name: service.name,
                    times: availableTimes,
                });
            }
        });
    }

    console.log('[API /getAvailability] Processed Data Sent to Frontend:', JSON.stringify(processedData, null, 2)); // Log processed data

    return NextResponse.json(processedData, { status: 200 })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 