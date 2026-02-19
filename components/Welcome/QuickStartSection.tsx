/**
 * QuickStartSection - Grid of quick action cards
 * Adapted for TeachAssist from CC4
 */

import { useRouter } from 'next/navigation'
import {
  Upload,
  MessageSquare,
  Users,
  HelpCircle,
  Calendar,
  UserPen,
  ArrowRight
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
  href?: string
  action?: () => void
}

interface QuickStartSectionProps {
  onOpenHelp?: () => void
}

export function QuickStartSection({ onOpenHelp }: QuickStartSectionProps) {
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: 'upload-sources',
      title: 'Upload Curriculum Sources',
      description: 'Add standards, lesson plans, and teaching resources',
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
      description: 'Get expert feedback from AI teaching advisors',
      icon: Users,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      href: '/council',
    },
    {
      id: 'plan-studio',
      title: 'Plan Studio',
      description: 'Design lessons and units with AI-assisted planning',
      icon: Calendar,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
      href: '/app/plan',
    },
    {
      id: 'edit-profile',
      title: 'Edit Public Profile',
      description: 'Update your teacher profile, photo, and schedule',
      icon: UserPen,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-500/10 hover:bg-teal-500/20',
      href: '/profile',
    },
    {
      id: 'view-help',
      title: 'View Help Documentation',
      description: 'Learn how to use TeachAssist effectively',
      icon: HelpCircle,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
      action: () => {
        if (onOpenHelp) {
          onOpenHelp()
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
            onClick={() => {
              if (action.action) {
                action.action()
              } else if (action.href) {
                router.push(action.href)
              }
            }}
            className={`group p-4 rounded-xl border border-gray-800 ${action.bgColor} transition-all duration-200 text-left`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gray-900/50`}>
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
