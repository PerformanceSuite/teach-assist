/**
 * Zustand store for Planning (Unit and Lesson) management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { UnitCreate, UnitResponse, LessonCreate, LessonResponse } from '@/lib/api'

interface PlanningState {
  // State
  units: UnitResponse[]
  lessons: LessonResponse[]
  selectedUnit: UnitResponse | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchUnits: () => Promise<void>
  createUnit: (data: UnitCreate) => Promise<{ success: boolean; error?: string; data?: UnitResponse }>
  fetchLessons: (unitId?: string) => Promise<void>
  createLesson: (data: LessonCreate) => Promise<{ success: boolean; error?: string; data?: LessonResponse }>
  selectUnit: (unit: UnitResponse | null) => void
  deleteUnit: (unitId: string) => Promise<void>
  clearError: () => void
}

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      // Initial state
      units: [],
      lessons: [],
      selectedUnit: null,
      isLoading: false,
      error: null,

      // Fetch all units
      fetchUnits: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.planning.listUnits()

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          set({
            units: result.data || [],
            isLoading: false,
            error: null
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch units',
            isLoading: false
          })
        }
      },

      // Create a new unit
      createUnit: async (data: UnitCreate) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.planning.createUnit(data)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return { success: false, error: result.error }
          }

          // Add to local state
          set((state) => ({
            units: [...state.units, result.data!],
            isLoading: false,
            error: null
          }))

          return { success: true, data: result.data }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to create unit'
          set({
            error: errorMsg,
            isLoading: false
          })
          return { success: false, error: errorMsg }
        }
      },

      // Fetch lessons (optionally filtered by unit)
      fetchLessons: async (unitId?: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.planning.listLessons(unitId)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          set({
            lessons: result.data || [],
            isLoading: false,
            error: null
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch lessons',
            isLoading: false
          })
        }
      },

      // Create a new lesson
      createLesson: async (data: LessonCreate) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.planning.createLesson(data)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return { success: false, error: result.error }
          }

          // Add to local state
          set((state) => ({
            lessons: [...state.lessons, result.data!],
            isLoading: false,
            error: null
          }))

          return { success: true, data: result.data }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to create lesson'
          set({
            error: errorMsg,
            isLoading: false
          })
          return { success: false, error: errorMsg }
        }
      },

      // Select a unit
      selectUnit: (unit: UnitResponse | null) => {
        set({ selectedUnit: unit })
      },

      // Delete a unit
      deleteUnit: async (unitId: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.planning.deleteUnit(unitId)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          // Remove from local state
          set((state) => ({
            units: state.units.filter(u => u.unit_id !== unitId),
            selectedUnit: state.selectedUnit?.unit_id === unitId ? null : state.selectedUnit,
            isLoading: false,
            error: null
          }))
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to delete unit',
            isLoading: false
          })
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'teachassist-planning-store',
      partialize: (state) => ({
        // Only persist units and lessons, not loading states
        units: state.units,
        lessons: state.lessons,
        selectedUnit: state.selectedUnit,
      }),
    }
  )
)

/**
 * Hook to get lessons for a specific unit
 */
export const useLessonsByUnit = (unitId: string) => {
  return usePlanningStore((state) =>
    state.lessons.filter(l => l.lesson_id.startsWith(unitId))
  )
}

/**
 * Hook to get unit count
 */
export const useUnitCount = () => {
  return usePlanningStore((state) => state.units.length)
}
