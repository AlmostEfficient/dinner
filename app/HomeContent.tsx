'use client'

import { AvailabilitySearchForm } from '@/components/Form'
import { AvailabilityResults } from '@/components/Results'
import { useAvailability } from './contexts/AvailabilityContext'

export default function HomeContent() {
  const { date } = useAvailability()

  return (
    <main className="container mx-auto p-4 flex flex-col items-center min-h-screen max-w-[430px] overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-4">dinner time 😋</h1>
      <AvailabilitySearchForm />
      <AvailabilityResults />
    </main>
  )
}

