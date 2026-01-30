/**
 * AIAssistant - Proactive suggestion sidebar with smooth animations
 */

'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  X,
  Sparkles,
  RefreshCw,
  Zap,
  Lightbulb,
  Bell,
  ArrowRight,
  Loader2,
  Upload,
  MessageSquare,
  Users,
  HelpCircle
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

// Quick action buttons configuration
const QUICK_ACTIONS = [
  { label: 'Upload a source', icon: Upload, route: '/sources', color: 'text-emerald-400' },
  { label: 'Ask a question', icon: MessageSquare, route: '/chat', color: 'text-blue-400' },
  { label: 'Consult the Council', icon: Users, route: '/council', color: 'text-purple-400' },
  { label: 'View help', icon: HelpCircle, route: null, action: 'help', color: 'text-orange-400' },
]

export function AIAssistantPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
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

  // Handle click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeAssistant()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeAssistant])

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.action === 'help') {
      // Import help store dynamically to avoid circular deps
      import('../../stores/helpStore').then(({ useHelpStore }) => {
        useHelpStore.getState().openHelp()
      })
      closeAssistant()
    } else if (action.route) {
      router.push(action.route)
      closeAssistant()
    }
  }

  return (
    <>
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeAssistant}
        aria-hidden="true"
      />

      {/* Panel with slide animation */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={refreshSuggestions}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={closeAssistant}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
                >
                  <Icon className={`w-4 h-4 ${action.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
          {isLoading && suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Analyzing your context...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <EmptyState onRefresh={refreshSuggestions} />
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suggestions</h3>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SuggestionCard
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300 font-mono text-xs">Cmd+.</kbd> to toggle
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
      className={`p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-2 ${PRIORITY_BORDER[suggestion.priority]} rounded-lg transition-all hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-750`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${config.bgColor} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{suggestion.title}</h4>
            <button
              onClick={onDismiss}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss suggestion"
            >
              <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{suggestion.description}</p>
          {suggestion.actionLabel && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-2 transition-colors font-medium"
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
      <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-full mb-4">
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-gray-900 dark:text-white font-medium mb-2">No suggestions right now</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        Continue working and I'll provide context-aware suggestions as you go.
      </p>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Check again
      </button>
    </div>
  )
}

export { AIAssistantFAB } from './AIAssistantFAB'
export default AIAssistantPanel
