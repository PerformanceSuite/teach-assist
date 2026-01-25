'use client'

/**
 * Global Keyboard Shortcuts Hook
 * Manages app-wide keyboard shortcuts for TeachAssist
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAIAssistantStore } from '../stores/aiAssistantStore'
import { useHelpStore } from '../stores/helpStore'

export function useGlobalShortcuts() {
  const router = useRouter()
  const { toggleAssistant } = useAIAssistantStore()
  const { toggleHelp } = useHelpStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' ||
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable

      // Cmd/Ctrl + . : Toggle AI Assistant
      if ((event.metaKey || event.ctrlKey) && event.key === '.') {
        event.preventDefault()
        toggleAssistant()
        return
      }

      // Cmd/Ctrl + / : Toggle Help Center
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault()
        toggleHelp()
        return
      }

      // Navigation shortcuts (don't trigger in input fields)
      if (!isInput && (event.metaKey || event.ctrlKey)) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            router.push('/')
            break
          case '2':
            event.preventDefault()
            router.push('/sources')
            break
          case '3':
            event.preventDefault()
            router.push('/chat')
            break
          case '4':
            event.preventDefault()
            router.push('/council')
            break
          case '0':
            event.preventDefault()
            router.push('/')
            break
        }
      }

      // ESC to close panels (works anywhere)
      if (event.key === 'Escape') {
        const { isOpen: assistantOpen, closeAssistant } = useAIAssistantStore.getState()
        const { isOpen: helpOpen, closeHelp } = useHelpStore.getState()

        if (assistantOpen) {
          event.preventDefault()
          closeAssistant()
        } else if (helpOpen) {
          event.preventDefault()
          closeHelp()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router, toggleAssistant, toggleHelp])
}

export default useGlobalShortcuts
