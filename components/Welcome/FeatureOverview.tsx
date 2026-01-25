/**
 * FeatureOverview - Card-based overview of main TeachAssist features (for new users)
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  FileText,
  MessageSquare,
  Users,
  BookOpen,
  Shield,
  Sparkles
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
    id: 'sources',
    title: 'Notebook Mode',
    description: 'Upload curriculum standards, lesson plans, and teaching materials for grounded AI assistance.',
    icon: FileText,
    color: 'from-emerald-500/20 to-emerald-600/10',
    route: '/sources',
  },
  {
    id: 'chat',
    title: 'Grounded Chat',
    description: 'Ask questions about your uploaded sources and get accurate, citation-backed answers.',
    icon: MessageSquare,
    color: 'from-blue-500/20 to-blue-600/10',
    route: '/chat',
  },
  {
    id: 'council',
    title: 'Inner Council',
    description: 'Consult specialized AI advisors for standards alignment, differentiation, and teaching strategies.',
    icon: Users,
    color: 'from-indigo-500/20 to-indigo-600/10',
    route: '/council',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'Organize and search across all your teaching materials in one place.',
    icon: BookOpen,
    color: 'from-purple-500/20 to-purple-600/10',
    route: '/sources',
  },
  {
    id: 'privacy',
    title: 'Privacy First',
    description: 'Your student data stays private. TeachAssist never grades assignments or makes decisions.',
    icon: Shield,
    color: 'from-gray-500/20 to-gray-600/10',
    route: '/privacy',
  },
  {
    id: 'assistant',
    title: 'AI Assistant',
    description: 'Get contextual suggestions and shortcuts to speed up your teaching workflow.',
    icon: Sparkles,
    color: 'from-pink-500/20 to-pink-600/10',
    route: '/',
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
            className={`p-5 rounded-xl bg-gradient-to-br ${feature.color} border border-cc-border hover:border-cc-accent/50 transition-all duration-200 text-left group`}
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
