/**
 * AIAssistantFAB - Floating Action Button to trigger AI Assistant sidebar
 */

'use client'

import { Sparkles } from 'lucide-react'
import { useAIAssistantStore } from '../../stores/aiAssistantStore'

export function AIAssistantFAB() {
  const { isOpen, openAssistant } = useAIAssistantStore()

  // Don't show FAB when panel is open
  if (isOpen) return null

  return (
    <button
      onClick={openAssistant}
      className="fixed bottom-6 right-6 z-30 group"
      aria-label="Open AI Assistant"
      title="Open AI Assistant (Cmd+.)"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out">
        <Sparkles className="w-6 h-6 text-white" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
        AI Assistant
        <span className="ml-2 text-gray-400 text-xs">Cmd+.</span>
      </div>
    </button>
  )
}

export default AIAssistantFAB
