'use client'

import { AvailabilitySearchForm } from '@/components/Form'
import { AvailabilityResults } from '@/components/Results'
import { AvailabilityProvider, useAvailability } from './contexts/AvailabilityContext'
import { format, isSameDay, parseISO } from 'date-fns'

export default function HomePage() {
  return (
    <AvailabilityProvider>
      <HomeContent />
    </AvailabilityProvider>
  )
}

function HomeContent() {
  const { date, numPeople, dinnerOnly } = useAvailability()
  const selectedDate = parseISO(date)

  return (
    <main className="container mx-auto p-4 flex flex-col items-center min-h-screen max-w-[430px] overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-4">dinner time 😋</h1>
      <AvailabilitySearchForm />

      <AvailabilityResults />
    </main>
  )
}
