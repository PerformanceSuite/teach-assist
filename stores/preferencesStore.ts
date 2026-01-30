/**
 * Preferences Store - App-wide user preferences
 * Includes accommodations mode toggle for IEP/504 context
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  // Accommodations mode - enables IEP/504-aware features
  // When ON, teacher can provide accommodation context manually
  // No student PII is stored - context is session-only
  accommodationsMode: boolean

  // Actions
  toggleAccommodationsMode: () => void
  setAccommodationsMode: (enabled: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      accommodationsMode: false,

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
        accommodationsMode: state.accommodationsMode,
      }),
    }
  )
)

export default usePreferencesStore
