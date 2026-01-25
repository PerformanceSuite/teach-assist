/**
 * AIAssistant - Proactive suggestion sidebar
 */

'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  X,
  Sparkles,
  RefreshCw,
  Zap,
  Lightbulb,
  Bell,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useAIAssistantStore, Suggestion } from '../../stores/aiAssistantStore'

const TYPE_CONFIG: Record<Suggestion['type'], { icon: React.ElementType; color: string; bgColor: string }> = {
  action: { icon: Zap, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  insight: { icon: Lightbulb, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  reminder: { icon: Bell, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  'next-step': { icon: ArrowRight, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
}

const PRIORITY_BORDER: Record<Suggestion['priority'], string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-gray-500',
}

export function AIAssistantPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    isOpen,
    closeAssistant,
    suggestions,
    isLoading,
    refreshSuggestions,
    dismissSuggestion,
    setCurrentRoute
  } = useAIAssistantStore()

  // Track route changes
  useEffect(() => {
    setCurrentRoute(pathname)
  }, [pathname, setCurrentRoute])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={closeAssistant}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-cc-bg border-l border-cc-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-cc-border flex items-center justify-between bg-cc-surface">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-medium text-white">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshSuggestions}
              disabled={isLoading}
              className="p-1.5 hover:bg-cc-bg rounded transition-colors disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={closeAssistant}
              className="p-1.5 hover:bg-cc-bg rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Analyzing your context...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <EmptyState onRefresh={refreshSuggestions} />
          ) : (
            <div className="space-y-3">
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onDismiss={() => dismissSuggestion(suggestion.id)}
                  onAction={() => {
                    if (suggestion.action) {
                      suggestion.action()
                    } else if (suggestion.actionLabel) {
                      // Default navigation based on action label
                      const routeMap: Record<string, string> = {
                        'Upload Sources': '/sources',
                        'Ask Questions': '/chat',
                        'Consult Council': '/council',
                        'View Sources': '/sources',
                      }
                      const route = routeMap[suggestion.actionLabel]
                      if (route) {
                        router.push(route)
                        closeAssistant()
                      }
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-cc-border bg-cc-surface/50">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-cc-bg border border-cc-border rounded text-gray-400">Cmd+.</kbd> to toggle
          </p>
        </div>
      </div>
    </>
  )
}

function SuggestionCard({
  suggestion,
  onDismiss,
  onAction
}: {
  suggestion: Suggestion
  onDismiss: () => void
  onAction: () => void
}) {
  const config = TYPE_CONFIG[suggestion.type]
  const Icon = config.icon

  return (
    <div
      className={`p-3 bg-cc-surface border border-cc-border border-l-2 ${PRIORITY_BORDER[suggestion.priority]} rounded-lg transition-all hover:bg-cc-surface/80`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${config.bgColor} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-white text-sm">{suggestion.title}</h3>
            <button
              onClick={onDismiss}
              className="p-0.5 hover:bg-cc-bg rounded transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
          {suggestion.actionLabel && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
            >
              {suggestion.actionLabel}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="p-3 bg-indigo-500/10 rounded-full mb-4">
        <Sparkles className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-white font-medium mb-2">No suggestions right now</h3>
      <p className="text-gray-400 text-sm mb-4">
        Continue working and I'll provide context-aware suggestions as you go.
      </p>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-3 py-1.5 bg-cc-surface border border-cc-border rounded-lg text-sm text-gray-300 hover:text-white hover:bg-cc-bg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Check again
      </button>
    </div>
  )
}

export default AIAssistantPanel
