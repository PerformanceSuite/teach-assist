/**
 * AI Assistant Store - Manages proactive suggestion state
 */

import { create } from 'zustand'

export interface Suggestion {
  id: string
  type: 'action' | 'insight' | 'reminder' | 'next-step'
  title: string
  description: string
  action?: () => void
  actionLabel?: string
  priority: 'high' | 'medium' | 'low'
  source: string
  timestamp: Date
}

interface AIAssistantState {
  isOpen: boolean
  suggestions: Suggestion[]
  isLoading: boolean
  lastRefresh: Date | null

  // Context tracking
  currentRoute: string
  recentActions: string[]

  // Actions
  openAssistant: () => void
  closeAssistant: () => void
  toggleAssistant: () => void
  setSuggestions: (suggestions: Suggestion[]) => void
  setLoading: (loading: boolean) => void
  dismissSuggestion: (id: string) => void
  setCurrentRoute: (route: string) => void
  addRecentAction: (action: string) => void
  refreshSuggestions: () => void
}

export const useAIAssistantStore = create<AIAssistantState>((set, get) => ({
  isOpen: false,
  suggestions: [],
  isLoading: false,
  lastRefresh: null,
  currentRoute: '/',
  recentActions: [],

  openAssistant: () => {
    set({ isOpen: true })
    get().refreshSuggestions()
  },

  closeAssistant: () => set({ isOpen: false }),

  toggleAssistant: () => {
    const { isOpen } = get()
    if (isOpen) {
      set({ isOpen: false })
    } else {
      set({ isOpen: true })
      get().refreshSuggestions()
    }
  },

  setSuggestions: (suggestions) => set({ suggestions, lastRefresh: new Date() }),

  setLoading: (loading) => set({ isLoading: loading }),

  dismissSuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.filter(s => s.id !== id)
  })),

  setCurrentRoute: (route) => {
    set({ currentRoute: route })
    // Refresh suggestions when route changes and panel is open
    if (get().isOpen) {
      get().refreshSuggestions()
    }
  },

  addRecentAction: (action) => set((state) => ({
    recentActions: [action, ...state.recentActions].slice(0, 10)
  })),

  refreshSuggestions: async () => {
    const { currentRoute, recentActions, setLoading, setSuggestions } = get()
    setLoading(true)

    try {
      // Import dynamically to avoid circular dependencies
      const { generateSuggestions } = await import('../services/suggestionEngine')
      const suggestions = await generateSuggestions({ currentRoute, recentActions })
      setSuggestions(suggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  },
}))

export default useAIAssistantStore
