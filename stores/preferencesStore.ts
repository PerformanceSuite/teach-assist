/**
 * Preferences Store - App-wide user preferences
 * Includes theme selection and accommodations mode
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface PreferencesState {
  // Theme preference
  theme: Theme

  // Accommodations mode - enables IEP/504-aware features
  // When ON, teacher can provide accommodation context manually
  // No student PII is stored - context is session-only
  accommodationsMode: boolean

  // Actions
  setTheme: (theme: Theme) => void
  toggleAccommodationsMode: () => void
  setAccommodationsMode: (enabled: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      accommodationsMode: false,

      setTheme: (theme: Theme) => set({ theme }),

      toggleAccommodationsMode: () => set((state) => ({
        accommodationsMode: !state.accommodationsMode
      })),

      setAccommodationsMode: (enabled: boolean) => set({
        accommodationsMode: enabled
      }),
    }),
    {
      name: 'teachassist-preferences',
      partialize: (state) => ({
        theme: state.theme,
        accommodationsMode: state.accommodationsMode,
      }),
    }
  )
)

export default usePreferencesStore
