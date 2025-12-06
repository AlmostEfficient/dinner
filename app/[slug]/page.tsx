'use client'

import { Suspense } from 'react'
import { AvailabilityProvider } from '../contexts/AvailabilityContext'
import HomeContent from '../HomeContent'

export default function SlugPage() {
  return (
    <Suspense fallback={null}>
      <AvailabilityProvider>
        <HomeContent />
      </AvailabilityProvider>
    </Suspense>
  )
}
