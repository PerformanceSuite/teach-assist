/**
 * FeatureOverview - Card-based overview of main TeachAssist features (for new users)
 * Adapted for TeachAssist from CC4
 */

import { useRouter } from 'next/navigation'
import {
  BookOpen,
  MessageSquare,
  Users,
  Brain,
  Lightbulb,
  Zap
} from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  route: string
}

const FEATURES: Feature[] = [
  {
    id: 'inner-council',
    title: 'Inner Council',
    description: 'Consult four AI advisors: Standards Guardian, Equity Advocate, Pedagogy Expert, and Time Protector.',
    icon: Users,
    color: 'from-purple-500/20 to-purple-600/10',
    route: '/council',
  },
  {
    id: 'ai-chat',
    title: 'AI Chat',
    description: 'Ask questions and get grounded answers backed by your uploaded curriculum sources.',
    icon: MessageSquare,
    color: 'from-blue-500/20 to-blue-600/10',
    route: '/chat',
  },
  {
    id: 'curriculum-sources',
    title: 'Curriculum Sources',
    description: 'Upload and organize standards, lesson plans, and teaching resources in one place.',
    icon: BookOpen,
    color: 'from-emerald-500/20 to-emerald-600/10',
    route: '/sources',
  },
  {
    id: 'ai-assistance',
    title: 'AI-Powered Insights',
    description: 'Get contextual suggestions and intelligent recommendations as you work.',
    icon: Brain,
    color: 'from-indigo-500/20 to-indigo-600/10',
    route: '/chat',
  },
  {
    id: 'quick-reference',
    title: 'Quick Reference',
    description: 'Access keyboard shortcuts and searchable help documentation anytime.',
    icon: Lightbulb,
    color: 'from-yellow-500/20 to-yellow-600/10',
    route: '/sources',
  },
  {
    id: 'smart-search',
    title: 'Semantic Search',
    description: 'Find relevant information across all your sources using natural language.',
    icon: Zap,
    color: 'from-pink-500/20 to-pink-600/10',
    route: '/chat',
  },
]

export function FeatureOverview() {
  const router = useRouter()

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-white mb-2">What You Can Do</h2>
      <p className="text-gray-400 text-sm mb-4">
        Explore the core features of TeachAssist
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => router.push(feature.route)}
            className={`p-5 rounded-xl bg-gradient-to-br ${feature.color} border border-gray-800 hover:border-indigo-500/50 transition-all duration-200 text-left group`}
          >
            <feature.icon className="w-8 h-8 text-white/80 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-white mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FeatureOverview
