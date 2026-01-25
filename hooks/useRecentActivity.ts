/**
 * Hook to fetch recent activity across all entity types
 */

import { useState, useEffect } from 'react'

export interface ActivityItem {
  id: string
  type: 'chat' | 'source' | 'council' | 'upload'
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
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

        // Fetch from TeachAssist backend endpoints
        const [sourcesRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/v1/sources/list`).then(r => r.json()),
        ])

        const items: ActivityItem[] = []

        // Process uploaded sources
        if (sourcesRes.status === 'fulfilled' && Array.isArray(sourcesRes.value.sources)) {
          sourcesRes.value.sources.forEach((source: any) => {
            items.push({
              id: source.id,
              type: 'source',
              title: source.title || source.filename,
              description: source.description || `${source.type} document`,
              status: 'uploaded',
              createdAt: new Date(source.created_at || source.uploadedAt),
              updatedAt: source.updated_at ? new Date(source.updated_at) : undefined,
            })
          })
        }

        // TODO: Add chat history when endpoint is ready
        // TODO: Add council consultations when endpoint is ready

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
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [limit])

  return { activities, loading, error }
}

export default useRecentActivity
