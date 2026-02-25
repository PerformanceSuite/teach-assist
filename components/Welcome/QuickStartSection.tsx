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
      iconColor: 'text-orange-500',
      bgColor: 'bg-white dark:bg-gray-900',
      href: '/app/plan',
    },
    {
      id: 'grade-studio',
      title: 'Grade Assignments',
      description: 'Create rubrics and evaluate student submissions using AI assistance',
      icon: GraduationCap,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-white dark:bg-gray-900',
      href: '/app/grade',
    },
    {
      id: 'write-narratives',
      title: 'Write Narratives',
      description: 'Draft personalized student progress reports and narrative feedback',
      icon: FileText,
      iconColor: 'text-purple-500',
      bgColor: 'bg-white dark:bg-gray-900',
      href: '/narratives',
    },
    {
      id: 'upload-sources',
      title: 'Upload Curriculum',
      description: 'Add state standards, existing lesson plans, and teaching resources',
      icon: Upload,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-white dark:bg-gray-900',
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
            className={`group p-5 rounded-2xl border border-gray-200 dark:border-gray-800 ${action.bgColor} shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-200 text-left`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group-hover:border-transparent transition-colors">
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.title}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickStartSection
