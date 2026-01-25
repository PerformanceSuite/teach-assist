/**
 * Zustand store for Knowledge Base sources
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface Source {
  id: string
  title: string
  filename: string
  filetype: string
  upload_date: string
  size_bytes: number
  chunk_count: number
}

interface SourcesState {
  // State
  sources: Source[]
  isLoading: boolean
  isUploading: boolean
  error: string | null
  stats: {
    total_documents: number
    total_chunks: number
    embedding_model: string
  } | null

  // Actions
  fetchSources: () => Promise<void>
  uploadSource: (file: File, title?: string) => Promise<{ success: boolean; error?: string; data?: any }>
  deleteSource: (sourceId: string) => Promise<void>
  fetchStats: () => Promise<void>
  clearError: () => void
}

export const useSourcesStore = create<SourcesState>()(
  persist(
    (set, get) => ({
      // Initial state
      sources: [],
      isLoading: false,
      isUploading: false,
      error: null,
      stats: null,

      // Fetch all sources
      fetchSources: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.sources.list()

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          set({
            sources: result.data || [],
            isLoading: false,
            error: null
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch sources',
            isLoading: false
          })
        }
      },

      // Upload a new source
      uploadSource: async (file: File, title?: string) => {
        set({ isUploading: true, error: null })
        try {
          const result = await api.sources.upload(file, title)

          if (result.error) {
            set({ error: result.error, isUploading: false })
            return { success: false, error: result.error }
          }

          // Refresh sources list after upload
          await get().fetchSources()

          set({ isUploading: false, error: null })
          return { success: true, data: result.data }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Upload failed'
          set({
            error: errorMsg,
            isUploading: false
          })
          return { success: false, error: errorMsg }
        }
      },

      // Delete a source
      deleteSource: async (sourceId: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await api.sources.delete(sourceId)

          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }

          // Remove from local state
          set((state) => ({
            sources: state.sources.filter(s => s.id !== sourceId),
            isLoading: false,
            error: null
          }))

          // Refresh stats
          await get().fetchStats()
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to delete source',
            isLoading: false
          })
        }
      },

      // Fetch knowledge base stats
      fetchStats: async () => {
        try {
          const result = await api.sources.stats()

          if (result.error) {
            console.error('Failed to fetch stats:', result.error)
            return
          }

          set({ stats: result.data || null })
        } catch (err) {
          console.error('Failed to fetch stats:', err)
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'teachassist-sources-store',
      partialize: (state) => ({
        // Only persist sources list, not loading states
        sources: state.sources,
      }),
    }
  )
)

/**
 * Hook to check if any sources are uploaded
 */
export const useHasSources = () => {
  return useSourcesStore((state) => state.sources.length > 0)
}

/**
 * Hook to get source count
 */
export const useSourceCount = () => {
  return useSourcesStore((state) => state.sources.length)
}
