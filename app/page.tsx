'use client'

import { Suspense } from 'react'
import { AvailabilityProvider } from './contexts/AvailabilityContext'
import HomeContent from './HomeContent'

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <AvailabilityProvider>
        <HomeContent />
      </AvailabilityProvider>
    </Suspense>
  )
}
