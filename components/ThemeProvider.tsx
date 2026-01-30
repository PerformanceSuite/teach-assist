/**
 * ThemeProvider - Applies theme class to document based on user preference
 */

'use client'

import { useEffect } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = usePreferencesStore()

  useEffect(() => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      // Check system preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(systemDark ? 'dark' : 'light')

      // Listen for system changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider
