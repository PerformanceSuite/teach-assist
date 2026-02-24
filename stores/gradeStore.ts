/**
 * Zustand store for Grade Studio state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import type {
  StudentWork,
  FeedbackDraft,
  RubricTemplate,
} from '@/lib/api'

interface GradeState {
  // Step tracking
  currentStep: number

  // Step 1: Setup
  assignmentName: string
  assignmentContext: string
  selectedRubricTemplateId: string | null
  rubricTemplates: RubricTemplate[]

  // Step 2: Submissions
  submissions: StudentWork[]

  // Step 3: Processing
  batchId: string | null
  isProcessing: boolean
  progress: { completed: number; total: number } | null
  processingError: string | null

  // Step 4: Review
  feedback: FeedbackDraft[]

  // Actions - Navigation
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Actions - Setup
  setAssignmentInfo: (name: string, context: string) => void
  setRubricTemplateId: (id: string | null) => void
  loadRubricTemplates: () => Promise<void>

  // Actions - Submissions
  addSubmission: (work: StudentWork) => void
  removeSubmission: (studentId: string) => void
  clearSubmissions: () => void
  importSubmissions: (works: StudentWork[]) => void

  // Actions - Processing
  generateFeedback: () => Promise<void>
  pollBatchStatus: () => Promise<boolean>

  // Actions - Review
  editFeedback: (studentId: string, draftComment: string, status: 'approved' | 'edited') => Promise<void>

  // Actions - Export
  exportFeedback: (format: 'csv' | 'txt' | 'json', approvedOnly?: boolean) => Promise<string | null>

  // Actions - Reset
  reset: () => void
}

const initialState = {
  currentStep: 1,
  assignmentName: '',
  assignmentContext: '',
  selectedRubricTemplateId: null as string | null,
  rubricTemplates: [] as RubricTemplate[],
  submissions: [] as StudentWork[],
  batchId: null as string | null,
  isProcessing: false,
  progress: null as { completed: number; total: number } | null,
  processingError: null as string | null,
  feedback: [] as FeedbackDraft[],
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      // Setup
      setAssignmentInfo: (name: string, context: string) => set({ assignmentName: name, assignmentContext: context }),
      setRubricTemplateId: (id: string | null) => set({ selectedRubricTemplateId: id }),

      loadRubricTemplates: async () => {
        const result = await api.narratives.listRubricTemplates()
        if (result.data) {
          set({ rubricTemplates: result.data })
        }
      },

      // Submissions
      addSubmission: (work: StudentWork) => {
        set((state) => {
          if (state.submissions.some(s => s.student_id === work.student_id)) {
            return state
          }
          return { submissions: [...state.submissions, work] }
        })
      },

      removeSubmission: (studentId: string) => {
        set((state) => ({
          submissions: state.submissions.filter(s => s.student_id !== studentId),
        }))
      },

      clearSubmissions: () => set({ submissions: [] }),

      importSubmissions: (works: StudentWork[]) => {
        set((state) => {
          const existing = new Set(state.submissions.map(s => s.student_id))
          const newWorks = works.filter(w => !existing.has(w.student_id))
          return { submissions: [...state.submissions, ...newWorks] }
        })
      },

      // Processing
      generateFeedback: async () => {
        const state = get()

        if (state.submissions.length === 0) {
          set({ processingError: 'No submissions to process' })
          return
        }

        set({ isProcessing: true, processingError: null, progress: null })

        try {
          const result = await api.grading.submitBatch({
            rubric_template_id: state.selectedRubricTemplateId || undefined,
            assignment_name: state.assignmentName,
            assignment_context: state.assignmentContext,
            submissions: state.submissions,
          })

          if (result.error) {
            set({ processingError: result.error, isProcessing: false })
            return
          }

          if (result.data) {
            set({
              batchId: result.data.batch_id,
              progress: { completed: 0, total: state.submissions.length },
            })

            // Start polling
            const pollInterval = setInterval(async () => {
              const done = await get().pollBatchStatus()
              if (done) {
                clearInterval(pollInterval)
              }
            }, 2000)
          }
        } catch (err) {
          set({
            processingError: err instanceof Error ? err.message : 'Processing failed',
            isProcessing: false,
          })
        }
      },

      pollBatchStatus: async () => {
        const state = get()
        if (!state.batchId) return true

        const result = await api.grading.getBatchStatus(state.batchId)

        if (result.error) {
          set({ processingError: result.error, isProcessing: false })
          return true
        }

        if (result.data) {
          if (result.data.status === 'complete') {
            set({
              feedback: result.data.feedback,
              isProcessing: false,
              progress: null,
              currentStep: 2,
            })
            return true
          } else if (result.data.status === 'error') {
            set({
              processingError: 'Batch processing failed',
              isProcessing: false,
            })
            return true
          } else if (result.data.progress) {
            set({ progress: result.data.progress })
          }
        }

        return false
      },

      // Review
      editFeedback: async (studentId: string, draftComment: string, status: 'approved' | 'edited') => {
        const state = get()
        if (!state.batchId) return

        const result = await api.grading.editFeedback(state.batchId, studentId, draftComment, status)

        if (result.data) {
          set((state) => ({
            feedback: state.feedback.map(f =>
              f.student_id === studentId
                ? { ...f, draft_comment: draftComment, status }
                : f
            ),
          }))
        }
      },

      // Export
      exportFeedback: async (format: 'csv' | 'txt' | 'json', approvedOnly = false) => {
        const state = get()
        if (!state.batchId) return null

        const result = await api.grading.exportBatch(state.batchId, format, approvedOnly)
        return result.data || null
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'teachassist-grade-store',
      partialize: (state) => ({
        assignmentName: state.assignmentName,
        assignmentContext: state.assignmentContext,
        selectedRubricTemplateId: state.selectedRubricTemplateId,
        submissions: state.submissions,
      }),
    }
  )
)
