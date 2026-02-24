/**
 * QuickStartSection - Grid of quick action cards
 * Adapted for TeachAssist from CC4
 */

import { useRouter } from 'next/navigation'
import {
  Upload,
  Calendar,
  GraduationCap,
  FileText,
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
      id: 'plan-studio',
      title: 'Plan a Lesson',
      description: 'Design comprehensive lesson plans and units aligned to your standards',
      icon: Calendar,
      iconColor: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      href: '/app/plan',
    },
    {
      id: 'grade-studio',
      title: 'Grade Assignments',
      description: 'Create rubrics and evaluate student submissions using AI assistance',
      icon: GraduationCap,
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      href: '/app/grade',
    },
    {
      id: 'write-narratives',
      title: 'Write Narratives',
      description: 'Draft personalized student progress reports and narrative feedback',
      icon: FileText,
      iconColor: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      href: '/narratives',
    },
    {
      id: 'upload-sources',
      title: 'Upload Curriculum',
      description: 'Add state standards, existing lesson plans, and teaching resources',
      icon: Upload,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      href: '/sources',
    },
  ]

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Start</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            className={`group p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-cc-surface shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 text-left`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${action.bgColor}`}>
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickStartSection
