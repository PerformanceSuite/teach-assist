/**
 * Zustand store for Student management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { StudentProfile, StudentCreate, StudentUpdate } from '@/lib/api'

interface StudentsState {
  // State
  students: StudentProfile[]
  selectedStudentIds: string[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchStudents: () => Promise<void>
  addStudent: (data: StudentCreate) => Promise<{ success: boolean; error?: string; data?: StudentProfile }>
  updateStudent: (id: string, data: StudentUpdate) => Promise<{ success: boolean; error?: string; data?: StudentProfile }>
  deleteStudent: (id: string) => Promise<void>
  selectStudents: (ids: string[]) => void
  clearSelection: () => void
  clearError: () => void
}

export const useStudentsStore = create<StudentsState>()(
  persist(
    (set, get) => ({
      // Initial state
      students: [],
      selectedStudentIds: [],
      isLoading: false,
      error: null,

      // Fetch all students
      fetchStudents: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.students.list()

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          set({
            students: result.data || [],
            isLoading: false,
            error: null
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch students',
            isLoading: false
          })
        }
      },

      // Add a new student
      addStudent: async (data: StudentCreate) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.students.create(data)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return { success: false, error: result.error }
          }

          // Add to local state
          set((state) => ({
            students: [...state.students, result.data!],
            isLoading: false,
            error: null
          }))

          return { success: true, data: result.data }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to add student'
          set({
            error: errorMsg,
            isLoading: false
          })
          return { success: false, error: errorMsg }
        }
      },

      // Update an existing student
      updateStudent: async (id: string, data: StudentUpdate) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.students.update(id, data)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return { success: false, error: result.error }
          }

          // Update in local state
          set((state) => ({
            students: state.students.map(s => s.id === id ? result.data! : s),
            isLoading: false,
            error: null
          }))

          return { success: true, data: result.data }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to update student'
          set({
            error: errorMsg,
            isLoading: false
          })
          return { success: false, error: errorMsg }
        }
      },

      // Delete a student
      deleteStudent: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.students.delete(id)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          // Remove from local state and selection
          set((state) => ({
            students: state.students.filter(s => s.id !== id),
            selectedStudentIds: state.selectedStudentIds.filter(sid => sid !== id),
            isLoading: false,
            error: null
          }))
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to delete student',
            isLoading: false
          })
        }
      },

      // Select students by IDs
      selectStudents: (ids: string[]) => {
        set({ selectedStudentIds: ids })
      },

      // Clear selection
      clearSelection: () => {
        set({ selectedStudentIds: [] })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'teachassist-students-store',
      partialize: (state) => ({
        // Only persist students list and selection, not loading states
        students: state.students,
        selectedStudentIds: state.selectedStudentIds,
      }),
    }
  )
)

/**
 * Hook to get selected students
 */
export const useSelectedStudents = () => {
  return useStudentsStore((state) =>
    state.students.filter(s => state.selectedStudentIds.includes(s.id))
  )
}

/**
 * Hook to get student count
 */
export const useStudentCount = () => {
  return useStudentsStore((state) => state.students.length)
}
