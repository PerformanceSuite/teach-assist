/**
 * QuickStartSection - Grid of quick action cards
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  Upload,
  MessageSquare,
  Users,
  FileText,
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
  action: () => void
}

interface QuickStartSectionProps {
  onOpenTutorial?: () => void
  onOpenCouncil?: () => void
}

export function QuickStartSection({
  onOpenTutorial,
  onOpenCouncil
}: QuickStartSectionProps) {
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: 'upload-source',
      title: 'Upload Curriculum',
      description: 'Add standards, lesson plans, or teaching materials',
      icon: Upload,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      action: () => router.push('/sources'),
    },
    {
      id: 'ask-question',
      title: 'Ask a Question',
      description: 'Get grounded answers from your uploaded sources',
      icon: MessageSquare,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      action: () => router.push('/chat'),
    },
    {
      id: 'consult-council',
      title: 'Consult Inner Council',
      description: 'Get structured advice from AI advisors',
      icon: Users,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      action: () => {
        if (onOpenCouncil) {
          onOpenCouncil()
        } else {
          router.push('/council')
        }
      },
    },
    {
      id: 'view-sources',
      title: 'View Knowledge Base',
      description: 'Browse and manage your uploaded documents',
      icon: FileText,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      action: () => router.push('/sources'),
    },
    {
      id: 'recent-chats',
      title: 'Recent Chats',
      description: 'See your recent conversations and searches',
      icon: BookOpen,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
      action: () => router.push('/chat'),
    },
    {
      id: 'tutorial',
      title: 'Getting Started',
      description: 'Learn how to use TeachAssist effectively',
      icon: GraduationCap,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
      action: () => {
        if (onOpenTutorial) {
          onOpenTutorial()
        }
      },
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-white mb-4">Quick Start</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`group p-4 rounded-xl border border-cc-border ${action.bgColor} transition-all duration-200 text-left`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-cc-bg/50`}>
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{action.title}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
