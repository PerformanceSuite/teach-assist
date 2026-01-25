/**
 * ContextualTip - Floating contextual help tip based on current route
 */

'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Lightbulb, X, ArrowRight } from 'lucide-react'
import { useHelpStore } from '../../stores/helpStore'

// Teacher-specific contextual tips
const CONTEXTUAL_TIPS: Record<string, { title: string; description: string; learnMoreId?: string }> = {
  '/sources': {
    title: 'Organize your knowledge base',
    description: 'Upload curriculum standards and lesson plans for grounded AI assistance',
    learnMoreId: 'sources-organizing',
  },
  '/chat': {
    title: 'All answers cite your sources',
    description: 'TeachAssist never makes things up - every answer references your uploaded documents',
    learnMoreId: 'chat-grounded-responses',
  },
  '/council': {
    title: 'Choose the right advisor',
    description: 'Each Inner Council member has specific expertise to help with different teaching challenges',
    learnMoreId: 'council-choosing-advisor',
  },
}

export function ContextualTip() {
  const pathname = usePathname()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [visible, setVisible] = useState(false)
  const { selectArticle, openHelp } = useHelpStore()

  const tip = CONTEXTUAL_TIPS[pathname]

  // Show tip after a delay when route changes
  useEffect(() => {
    if (tip && !dismissed.has(pathname)) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [pathname, tip, dismissed])

  const handleDismiss = () => {
    setDismissed(prev => new Set(prev).add(pathname))
    setVisible(false)
  }

  const handleLearnMore = () => {
    if (tip?.learnMoreId) {
      openHelp()
      selectArticle(tip.learnMoreId)
    }
    handleDismiss()
  }

  if (!visible || !tip) return null

  return (
    <div className="fixed bottom-24 right-4 w-72 bg-cc-surface border border-cc-border rounded-xl p-4 shadow-xl z-30 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-yellow-500/10 rounded-lg flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{tip.title}</p>
          <p className="text-xs text-gray-400 mt-1">{tip.description}</p>
          {tip.learnMoreId && (
            <button
              onClick={handleLearnMore}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
            >
              Learn more
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-cc-bg rounded transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export default ContextualTip
