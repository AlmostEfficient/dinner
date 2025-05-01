'use client'

import React from 'react'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, availableThemes } = useTheme()
  
  const handleThemeToggle = () => {
    // Simple toggle between the first two themes
    const themeNames = Object.keys(availableThemes)
    const currentIndex = themeNames.indexOf(theme.name)
    const nextIndex = (currentIndex + 1) % themeNames.length
    setTheme(themeNames[nextIndex])
  }
  
  return (
    <div className="fixed top-4 right-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleThemeToggle}
        className="text-xs"
      >
        Theme: {theme.name}
      </Button>
    </div>
  )
} 