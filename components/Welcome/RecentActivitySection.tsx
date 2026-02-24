/**
 * RecentActivitySection - Shows recent activity across all entities
 * Adapted for TeachAssist from CC4
 */

import { useRouter } from 'next/navigation'
import {
  FileText,
  MessageSquare,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react'
import { ActivityItem } from '../../hooks/useRecentActivity'

interface RecentActivitySectionProps {
  activities: ActivityItem[]
  loading: boolean
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; route: string }> = {
  document: { icon: FileText, color: 'text-emerald-400', route: '/sources' },
  chat: { icon: MessageSquare, color: 'text-blue-400', route: '/chat' },
  council: { icon: Users, color: 'text-purple-400', route: '/council' },
}

export function RecentActivitySection({ activities, loading }: RecentActivitySectionProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white dark:bg-cc-surface rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800/80 rounded" />
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
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
        <div className="p-8 bg-white dark:bg-cc-surface rounded-2xl border border-gray-200 dark:border-gray-800 text-center shadow-sm">
          <Clock className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No activity yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Upload your first curriculum source or ask a question to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity) => {
          const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.document
          const Icon = config.icon

          return (
            <button
              key={activity.id}
              onClick={() => router.push(config.route)}
              className="w-full p-5 bg-white dark:bg-cc-surface hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">{activity.title}</span>
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {activity.type}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 leading-relaxed">{activity.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                  <span className="text-sm font-medium">{formatTimeAgo(activity.updatedAt || activity.createdAt)}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
