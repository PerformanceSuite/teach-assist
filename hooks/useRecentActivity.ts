/**
 * Hook to fetch recent activity across all entity types
 * Adapted for TeachAssist from CC4
 */

import { useState, useEffect } from 'react'

export interface ActivityItem {
  id: string
  type: 'document' | 'chat' | 'council'
  title: string
  description?: string
  status?: string
  createdAt: Date
  updatedAt?: Date
}

export function useRecentActivity(limit = 10) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true)
      setError(null)

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'
        
        // Fetch from multiple endpoints in parallel
        const [documentsRes, chatsRes] = await Promise.allSettled([
          fetch(`${apiUrl}/api/v1/sources/list`).then(r => r.json()),
          fetch(`${apiUrl}/api/v1/chat/history`).then(r => r.json()),
        ])

        const items: ActivityItem[] = []

        // Process documents
        if (documentsRes.status === 'fulfilled' && Array.isArray(documentsRes.value)) {
          documentsRes.value.forEach((doc: any) => {
            items.push({
              id: doc.id,
              type: 'document',
              title: doc.title || doc.name || 'Untitled Document',
              description: doc.description || `Uploaded document`,
              createdAt: new Date(doc.created_at || doc.createdAt || Date.now()),
              updatedAt: doc.updated_at ? new Date(doc.updated_at) : undefined,
            })
          })
        }

        // Process chats
        if (chatsRes.status === 'fulfilled' && Array.isArray(chatsRes.value)) {
          chatsRes.value.forEach((chat: any) => {
            items.push({
              id: chat.id,
              type: 'chat',
              title: chat.query || chat.question || 'Chat Query',
              description: chat.answer ? chat.answer.substring(0, 100) + '...' : undefined,
              createdAt: new Date(chat.created_at || chat.createdAt || Date.now()),
              updatedAt: chat.updated_at ? new Date(chat.updated_at) : undefined,
            })
          })
        }

        // Sort by most recent (updated or created)
        items.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt
          const dateB = b.updatedAt || b.createdAt
          return dateB.getTime() - dateA.getTime()
        })

        // Take top N
        setActivities(items.slice(0, limit))
      } catch (err) {
        setError('Failed to fetch recent activity')
        console.error('Error fetching activity:', err)
        // For development, set empty array instead of failing
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [limit])

  return { activities, loading, error }
}

export default useRecentActivity
