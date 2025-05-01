'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeConfig, themes, defaultTheme } from '../styles/theme'

type ThemeContextType = {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig | string) => void
  availableThemes: Record<string, ThemeConfig>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme)

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(cssVar, value)
    })
    
    // Apply radii
    Object.entries(theme.radii).forEach(([key, value]) => {
      const cssVar = '--radius' + (key === 'lg' ? '' : `-${key}`)
      root.style.setProperty(cssVar, value)
    })
    
    // Set the theme name as a class on the html element
    root.className = `light theme-${theme.name}`
  }, [theme])

  const setTheme = (newTheme: ThemeConfig | string) => {
    if (typeof newTheme === 'string') {
      const themeConfig = themes[newTheme as keyof typeof themes]
      if (themeConfig) {
        setThemeState(themeConfig)
      }
    } else {
      setThemeState(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 