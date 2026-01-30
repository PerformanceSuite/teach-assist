/**
 * Zustand store for Narratives wizard state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import type {
  StudentData,
  StudentNarrative,
  PatternDetected,
  ClusterInfo,
  SynthesizeOptions,
  IBCriterion,
} from '@/lib/api'

interface NarrativesState {
  // Wizard navigation
  currentStep: number

  // Step 1: Class Setup
  className: string
  semester: string
  rubricLoaded: boolean
  rubricCriteria: IBCriterion[]

  // Step 2: Student Data
  students: StudentData[]

  // Step 3: Generation
  batchId: string | null
  isGenerating: boolean
  progress: { completed: number; total: number } | null
  generationError: string | null

  // Step 4: Results
  narratives: StudentNarrative[]
  patterns: PatternDetected[]
  clusters: ClusterInfo[]

  // Generation options
  options: SynthesizeOptions

  // Actions - Navigation
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Actions - Class Setup
  setClassInfo: (className: string, semester: string) => void
  loadRubric: () => Promise<void>

  // Actions - Student Data
  addStudent: (student: StudentData) => void
  updateStudent: (initials: string, data: Partial<StudentData>) => void
  removeStudent: (initials: string) => void
  importStudents: (students: StudentData[]) => void
  clearStudents: () => void

  // Actions - Generation
  setOptions: (options: Partial<SynthesizeOptions>) => void
  generateNarratives: () => Promise<void>
  pollBatchStatus: () => Promise<boolean>

  // Actions - Review
  updateNarrative: (initials: string, draft: string, status: 'approved' | 'needs_revision') => Promise<void>

  // Actions - Export
  exportNarratives: (format: 'csv' | 'txt' | 'json', approvedOnly?: boolean) => Promise<string | null>

  // Actions - Reset
  reset: () => void
}

const initialState = {
  currentStep: 1,
  className: '',
  semester: '',
  rubricLoaded: false,
  rubricCriteria: [],
  students: [],
  batchId: null,
  isGenerating: false,
  progress: null,
  generationError: null,
  narratives: [],
  patterns: [],
  clusters: [],
  options: {
    tone: 'encouraging' as const,
    include_growth_area: true,
    council_review: [],
  },
}

export const useNarrativesStore = create<NarrativesState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      // Class Setup
      setClassInfo: (className: string, semester: string) => set({ className, semester }),

      loadRubric: async () => {
        const result = await api.narratives.loadIBRubric('MYP3')
        if (result.data) {
          set({
            rubricLoaded: true,
            rubricCriteria: result.data.criteria,
          })
        }
      },

      // Student Data
      addStudent: (student: StudentData) => {
        set((state) => {
          // Check for duplicate initials
          if (state.students.some((s) => s.initials === student.initials)) {
            return state // Don't add duplicate
          }
          return { students: [...state.students, student] }
        })
      },

      updateStudent: (initials: string, data: Partial<StudentData>) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.initials === initials ? { ...s, ...data } : s
          ),
        }))
      },

      removeStudent: (initials: string) => {
        set((state) => ({
          students: state.students.filter((s) => s.initials !== initials),
        }))
      },

      importStudents: (students: StudentData[]) => {
        set((state) => {
          const existingInitials = new Set(state.students.map((s) => s.initials))
          const newStudents = students.filter((s) => !existingInitials.has(s.initials))
          return { students: [...state.students, ...newStudents] }
        })
      },

      clearStudents: () => set({ students: [] }),

      // Generation Options
      setOptions: (options: Partial<SynthesizeOptions>) => {
        set((state) => ({
          options: { ...state.options, ...options },
        }))
      },

      // Generate Narratives
      generateNarratives: async () => {
        const state = get()

        if (state.students.length === 0) {
          set({ generationError: 'No students to generate narratives for' })
          return
        }

        set({ isGenerating: true, generationError: null, progress: null })

        const request = {
          class_name: state.className,
          semester: state.semester,
          students: state.students,
          options: state.options,
        }

        try {
          if (state.students.length <= 10) {
            // Sync mode for small batches
            const result = await api.narratives.synthesize(request)

            if (result.error) {
              set({ generationError: result.error, isGenerating: false })
              return
            }

            if (result.data) {
              set({
                batchId: result.data.batch_id,
                narratives: result.data.narratives,
                patterns: result.data.patterns_detected,
                isGenerating: false,
                currentStep: 4, // Auto-advance to review
              })
            }
          } else {
            // Async mode for larger batches
            const result = await api.narratives.submitBatch(request)

            if (result.error) {
              set({ generationError: result.error, isGenerating: false })
              return
            }

            if (result.data) {
              set({
                batchId: result.data.batch_id,
                progress: { completed: 0, total: state.students.length },
              })

              // Start polling
              const pollInterval = setInterval(async () => {
                const done = await get().pollBatchStatus()
                if (done) {
                  clearInterval(pollInterval)
                }
              }, 2000)
            }
          }
        } catch (err) {
          set({
            generationError: err instanceof Error ? err.message : 'Generation failed',
            isGenerating: false,
          })
        }
      },

      // Poll for batch status
      pollBatchStatus: async () => {
        const state = get()
        if (!state.batchId) return true

        const result = await api.narratives.getBatchStatus(state.batchId)

        if (result.error) {
          set({ generationError: result.error, isGenerating: false })
          return true
        }

        if (result.data) {
          if (result.data.status === 'complete') {
            set({
              narratives: result.data.narratives,
              patterns: result.data.patterns_detected,
              clusters: result.data.clusters,
              isGenerating: false,
              progress: null,
              currentStep: 4, // Auto-advance to review
            })
            return true
          } else if (result.data.status === 'error') {
            set({
              generationError: 'Batch processing failed',
              isGenerating: false,
            })
            return true
          } else if (result.data.progress) {
            set({ progress: result.data.progress })
          }
        }

        return false
      },

      // Update narrative after edit
      updateNarrative: async (initials: string, draft: string, status: 'approved' | 'needs_revision') => {
        const state = get()
        if (!state.batchId) return

        const result = await api.narratives.editNarrative(state.batchId, initials, draft, status)

        if (result.data) {
          // Update local state
          set((state) => ({
            narratives: state.narratives.map((n) =>
              n.initials === initials
                ? { ...n, draft, status: status === 'approved' ? 'approved' : 'needs_attention' }
                : n
            ),
          }))
        }
      },

      // Export narratives
      exportNarratives: async (format: 'csv' | 'txt' | 'json', approvedOnly = false) => {
        const state = get()
        if (!state.batchId) return null

        const result = await api.narratives.exportBatch(state.batchId, format, approvedOnly)
        return result.data || null
      },

      // Reset store
      reset: () => set(initialState),
    }),
    {
      name: 'teachassist-narratives-store',
      partialize: (state) => ({
        // Persist class info and students between sessions
        className: state.className,
        semester: state.semester,
        students: state.students,
        rubricLoaded: state.rubricLoaded,
        // Don't persist generation results or wizard step
      }),
    }
  )
)

// Helper hooks
export const useStudentCount = () => useNarrativesStore((state) => state.students.length)
export const useCanGenerate = () =>
  useNarrativesStore((state) => state.students.length > 0 && state.className && state.semester)
export const useApprovedCount = () =>
  useNarrativesStore((state) => state.narratives.filter((n) => n.status === 'approved').length)
