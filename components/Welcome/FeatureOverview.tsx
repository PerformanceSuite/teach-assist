/**
 * FeatureOverview - Card-based overview of TeachAssist features (for new users)
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  BookOpen,
  MessageSquare,
  Users,
  Upload,
  GraduationCap,
  Sparkles
} from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  href: string
}

const FEATURES: Feature[] = [
  {
    id: 'notebook-mode',
    title: 'Notebook Mode',
    description: 'Upload curriculum sources and get grounded, citation-backed answers to your questions.',
    icon: BookOpen,
    color: 'from-emerald-500/20 to-emerald-600/10',
    href: '/sources',
  },
  {
    id: 'chat',
    title: 'Grounded Chat',
    description: 'Ask questions about your sources and get accurate answers with citations.',
    icon: MessageSquare,
    color: 'from-blue-500/20 to-blue-600/10',
    href: '/chat',
  },
  {
    id: 'council',
    title: 'Inner Council',
    description: 'Consult specialized AI advisors for standards alignment, equity, and pedagogical guidance.',
    icon: Users,
    color: 'from-purple-500/20 to-purple-600/10',
    href: '/council',
  },
  {
    id: 'sources',
    title: 'Knowledge Base',
    description: 'Manage your uploaded documents, lesson plans, and teaching materials.',
    icon: Upload,
    color: 'from-orange-500/20 to-orange-600/10',
    href: '/sources',
  },
  {
    id: 'grading',
    title: 'Grade Studio',
    description: 'Batch grading with AI-generated feedback drafts while maintaining your voice (coming soon).',
    icon: GraduationCap,
    color: 'from-indigo-500/20 to-indigo-600/10',
    href: '#',
  },
  {
    id: 'planning',
    title: 'Sunday Rescue Mode',
    description: 'Quick lesson planning assistance using UbD framework (coming soon).',
    icon: Sparkles,
    color: 'from-pink-500/20 to-pink-600/10',
    href: '#',
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
            onClick={() => feature.href !== '#' && router.push(feature.href)}
            className={`p-5 rounded-xl bg-gradient-to-br ${feature.color} border border-gray-700 hover:border-indigo-500/50 transition-all duration-200 text-left group ${feature.href === '#' ? 'cursor-not-allowed opacity-60' : ''}`}
            disabled={feature.href === '#'}
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
