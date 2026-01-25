/**
 * ContextualTip - Floating contextual help tip based on current route
 */

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Lightbulb, X, ArrowRight } from 'lucide-react'
import { CONTEXTUAL_TIPS } from '../../data/contextualTips'
import { useHelpStore } from '../../stores/helpStore'

export function ContextualTip() {
  const location = useLocation()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [visible, setVisible] = useState(false)
  const { selectArticle, openHelp } = useHelpStore()

  const tip = CONTEXTUAL_TIPS[location.pathname]

  // Show tip after a delay when route changes
  useEffect(() => {
    if (tip && !dismissed.has(location.pathname)) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [location.pathname, tip, dismissed])

  const handleDismiss = () => {
    setDismissed(prev => new Set(prev).add(location.pathname))
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
