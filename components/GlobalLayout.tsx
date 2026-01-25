/**
 * GlobalLayout - Client-side layout with keyboard shortcuts and global UI
 */

'use client'

import { useRouter } from 'next/navigation'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useAIAssistantStore } from '../stores/aiAssistantStore'
import { useHelpStore } from '../stores/helpStore'
import { AIAssistantPanel } from './AIAssistant'
import { HelpCenter } from './HelpCenter'

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
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
    {
      key: 'u',
      metaKey: true,
      handler: () => router.push('/sources'),
      description: 'Go to Upload Sources',
    },
    {
      key: 'j',
      metaKey: true,
      handler: () => router.push('/chat'),
      description: 'Go to Chat',
    },
    {
      key: 'c',
      metaKey: true,
      shiftKey: true,
      handler: () => router.push('/council'),
      description: 'Go to Inner Council',
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
