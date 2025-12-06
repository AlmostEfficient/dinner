'use client'

import { AvailabilityProvider } from '../contexts/AvailabilityContext'
import { HomeContent } from '../page'

export default function SlugPage() {
  return (
    <AvailabilityProvider>
      <HomeContent />
    </AvailabilityProvider>
  )
}

