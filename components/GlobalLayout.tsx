/**
 * GlobalLayout - Client-side layout with keyboard shortcuts and global UI
 */

'use client'

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useAIAssistantStore } from '../stores/aiAssistantStore'
import { useHelpStore } from '../stores/helpStore'
import { AIAssistantPanel } from './AIAssistant'
import { HelpCenter } from './HelpCenter'

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const { toggleAssistant } = useAIAssistantStore()
  const { toggleHelp } = useHelpStore()

  // Set up keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '.',
      metaKey: true,
      handler: toggleAssistant,
      description: 'Toggle AI Assistant',
    },
    {
      key: '/',
      metaKey: true,
      handler: toggleHelp,
      description: 'Toggle Help Center',
    },
  ])

  return (
    <>
      {children}
      <AIAssistantPanel />
      <HelpCenter />
    </>
  )
}

export default GlobalLayout
