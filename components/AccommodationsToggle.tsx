/**
 * AccommodationsToggle - Toggle for IEP/504 accommodations-aware mode
 *
 * When enabled:
 * - Shows notice about IEP/504 context
 * - AI responses become accommodations-aware
 * - Teacher provides context manually; no student PII stored
 */

'use client'

import { useState } from 'react'
import { Accessibility, ChevronDown, ExternalLink, Info } from 'lucide-react'
import { usePreferencesStore } from '../stores/preferencesStore'

export function AccommodationsToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const { accommodationsMode, toggleAccommodationsMode } = usePreferencesStore()

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
          accommodationsMode
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 border border-transparent'
        }`}
        title="Accommodations Mode"
      >
        <Accessibility className="w-4 h-4" />
        <span className="hidden sm:inline">
          {accommodationsMode ? 'Accommodations On' : 'Accommodations'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-gray-900 border border-gray-700 shadow-xl z-50">
            <div className="p-4">
              {/* Toggle Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">
                    Accommodations Mode
                  </span>
                </div>
                <button
                  onClick={toggleAccommodationsMode}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    accommodationsMode ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      accommodationsMode ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 mb-3">
                Enable to get suggestions that consider{' '}
                <a
                  href="https://www.understood.org/en/articles/what-is-an-iep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-0.5"
                >
                  IEP
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                {' '}and{' '}
                <a
                  href="https://www.understood.org/en/articles/what-is-a-504-plan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-0.5"
                >
                  504 plans
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                . You provide accommodation context manually.
              </p>

              {/* Privacy Notice - Only shown when enabled */}
              {accommodationsMode && (
                <div className="p-2.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <div className="flex gap-2">
                    <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-purple-200/80">
                      <p className="font-medium text-purple-200 mb-1">
                        No student PII stored
                      </p>
                      <p>
                        Provide accommodation needs in your prompts (e.g., &quot;extended time&quot;,
                        &quot;visual supports&quot;). Use codes or initials, never student names.
                        Context is session-only and not retained.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AccommodationsToggle
