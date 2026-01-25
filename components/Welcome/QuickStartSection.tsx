/**
 * QuickStartSection - Grid of quick action cards for teachers
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  Upload,
  MessageSquare,
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
  href: string
}

export function QuickStartSection() {
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: 'upload-sources',
      title: 'Upload Sources',
      description: 'Add curriculum standards, lesson plans, or teaching materials',
      icon: Upload,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      href: '/sources',
    },
    {
      id: 'ask-question',
      title: 'Ask a Question',
      description: 'Get grounded answers from your uploaded sources',
      icon: MessageSquare,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      href: '/chat',
    },
    {
      id: 'consult-council',
      title: 'Consult Inner Council',
      description: 'Get expert advice from specialized AI advisors',
      icon: Users,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      href: '/council',
    },
    {
      id: 'view-sources',
      title: 'View Knowledge Base',
      description: 'Browse and manage your uploaded documents',
      icon: BookOpen,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
      href: '/sources',
    },
    {
      id: 'grade-studio',
      title: 'Grade Studio (Coming Soon)',
      description: 'Batch grading with AI-generated feedback drafts',
      icon: GraduationCap,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      href: '#',
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-white mb-4">Quick Start</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.href !== '#' && router.push(action.href)}
            className={`group p-4 rounded-xl border border-gray-700 ${action.bgColor} transition-all duration-200 text-left ${action.href === '#' ? 'cursor-not-allowed opacity-60' : ''}`}
            disabled={action.href === '#'}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gray-900/50`}>
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{action.title}</h3>
                  {action.href !== '#' && (
                    <ArrowRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickStartSection
