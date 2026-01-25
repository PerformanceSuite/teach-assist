/**
 * RecentActivitySection - Shows recent teaching activity
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  Upload,
  MessageSquare,
  Users,
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'upload' | 'chat' | 'council' | 'source'
  title: string
  description?: string
  createdAt: Date
  updatedAt?: Date
}

interface RecentActivitySectionProps {
  activities: ActivityItem[]
  loading: boolean
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; route: string }> = {
  upload: { icon: Upload, color: 'text-emerald-400', route: '/sources' },
  chat: { icon: MessageSquare, color: 'text-blue-400', route: '/chat' },
  council: { icon: Users, color: 'text-purple-400', route: '/council' },
  source: { icon: BookOpen, color: 'text-orange-400', route: '/sources' },
}

export function RecentActivitySection({ activities, loading }: RecentActivitySectionProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-900 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-900 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
        <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 text-center">
          <Clock className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No activity yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Upload your first document or ask a question to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {activities.map((activity) => {
          const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.source
          const Icon = config.icon

          return (
            <button
              key={activity.id}
              onClick={() => router.push(config.route)}
              className="w-full p-4 bg-gray-800 hover:bg-gray-800/80 rounded-xl border border-gray-700 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-900`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{activity.title}</span>
                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-900 rounded-full">
                      {activity.type}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">{activity.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-xs">{formatTimeAgo(activity.updatedAt || activity.createdAt)}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default RecentActivitySection
