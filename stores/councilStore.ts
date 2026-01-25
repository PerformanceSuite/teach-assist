/**
 * Zustand store for Inner Council state.
 *
 * Tracks unread "attention" items from the Inner Council:
 * - Council consultation responses
 * - Important advisories
 * - Standards alignment warnings
 * - Differentiation suggestions
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AttentionItem {
  id: string
  type: 'council_response' | 'advisory' | 'standards_warning' | 'suggestion'
  title: string
  description?: string
  entityId: string
  entityType: 'council' | 'advisory'
  timestamp: Date
  read: boolean
}

interface CouncilState {
  // Attention items (unread high-priority events)
  attentionItems: AttentionItem[]

  // UI state
  feedOpen: boolean

  // Computed
  hasUnreadAttention: () => boolean
  unreadCount: () => number

  // Actions
  addAttentionItem: (item: Omit<AttentionItem, 'read' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAttentionItems: () => void
  setFeedOpen: (open: boolean) => void
  toggleFeed: () => void
}

export const useCouncilStore = create<CouncilState>()(
  persist(
    (set, get) => ({
      attentionItems: [],
      feedOpen: false,

      hasUnreadAttention: () => {
        return get().attentionItems.some(item => !item.read)
      },

      unreadCount: () => {
        return get().attentionItems.filter(item => !item.read).length
      },

      addAttentionItem: (item) => {
        const newItem: AttentionItem = {
          ...item,
          timestamp: new Date(),
          read: false,
        }
        set((state) => ({
          attentionItems: [newItem, ...state.attentionItems].slice(0, 50), // Keep last 50
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          attentionItems: state.attentionItems.map(item =>
            item.id === id ? { ...item, read: true } : item
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          attentionItems: state.attentionItems.map(item => ({ ...item, read: true })),
        }))
      },

      clearAttentionItems: () => {
        set({ attentionItems: [] })
      },

      setFeedOpen: (open) => {
        set({ feedOpen: open })
        // Mark all as read when opening feed
        if (open) {
          get().markAllAsRead()
        }
      },

      toggleFeed: () => {
        const newState = !get().feedOpen
        get().setFeedOpen(newState)
      },
    }),
    {
      name: 'teachassist-council-store',
      partialize: (state) => ({
        attentionItems: state.attentionItems,
      }),
    }
  )
)

/**
 * Hook to check if there are unread attention items.
 */
export const useHasUnreadAttention = () => {
  return useCouncilStore((state) => state.attentionItems.some(item => !item.read))
}

/**
 * Hook to get unread count.
 */
export const useUnreadAttentionCount = () => {
  return useCouncilStore((state) => state.attentionItems.filter(item => !item.read).length)
}
