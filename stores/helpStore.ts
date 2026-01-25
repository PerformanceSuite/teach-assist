/**
 * Help Center Store - Manages help panel state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HelpState {
  isOpen: boolean
  searchQuery: string
  activeCategory: string | null
  selectedArticleId: string | null
  viewedArticles: string[]

  // Actions
  openHelp: () => void
  closeHelp: () => void
  toggleHelp: () => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: string | null) => void
  selectArticle: (id: string | null) => void
  markArticleViewed: (id: string) => void
  goBack: () => void
}

export const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      searchQuery: '',
      activeCategory: null,
      selectedArticleId: null,
      viewedArticles: [],

      openHelp: () => set({ isOpen: true }),
      closeHelp: () => set({ isOpen: false, searchQuery: '', selectedArticleId: null }),
      toggleHelp: () => {
        const { isOpen } = get()
        if (isOpen) {
          set({ isOpen: false, searchQuery: '', selectedArticleId: null })
        } else {
          set({ isOpen: true })
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query, selectedArticleId: null }),
      setActiveCategory: (category) => set({ activeCategory: category, selectedArticleId: null }),

      selectArticle: (id) => {
        if (id) {
          get().markArticleViewed(id)
        }
        set({ selectedArticleId: id })
      },

      markArticleViewed: (id) => set((state) => ({
        viewedArticles: state.viewedArticles.includes(id)
          ? state.viewedArticles
          : [...state.viewedArticles, id]
      })),

      goBack: () => set({ selectedArticleId: null }),
    }),
    {
      name: 'cc4-help-store',
      partialize: (state) => ({
        viewedArticles: state.viewedArticles,
      }),
    }
  )
)

export default useHelpStore
