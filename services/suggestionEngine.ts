/**
 * Suggestion Engine - Generates context-aware suggestions for teachers
 */

import { Suggestion } from '../stores/aiAssistantStore'

interface SuggestionContext {
  currentRoute: string
  recentActions: string[]
}

// Route-specific suggestions for TeachAssist
const ROUTE_SUGGESTIONS: Record<string, Omit<Suggestion, 'id' | 'timestamp'>[]> = {
  '/': [
    {
      type: 'action',
      title: 'Upload curriculum standards',
      description: 'Start by uploading your curriculum documents, standards, or lesson plans',
      actionLabel: 'Upload Sources',
      priority: 'high',
      source: 'welcome',
    },
    {
      type: 'next-step',
      title: 'Try asking about your sources',
      description: 'Once uploaded, ask grounded questions about your curriculum materials',
      actionLabel: 'Ask Questions',
      priority: 'medium',
      source: 'welcome',
    },
    {
      type: 'insight',
      title: 'Meet your Inner Council',
      description: 'Get structured advice from 4 AI advisors specialized in different teaching areas',
      actionLabel: 'Consult Council',
      priority: 'medium',
      source: 'welcome',
    },
  ],
  '/sources': [
    {
      type: 'insight',
      title: 'Organize by subject or unit',
      description: 'Tag documents by subject, grade level, or unit for easier searching later',
      priority: 'medium',
      source: 'sources',
    },
    {
      type: 'action',
      title: 'Upload lesson plans',
      description: 'Add lesson plans alongside standards for comprehensive reference material',
      priority: 'low',
      source: 'sources',
    },
    {
      type: 'reminder',
      title: 'Keep sources current',
      description: 'Update curriculum documents when standards or materials change',
      priority: 'low',
      source: 'sources',
    },
  ],
  '/chat': [
    {
      type: 'reminder',
      title: 'Ask about standards alignment',
      description: 'Check how lessons or activities align with your uploaded standards',
      priority: 'medium',
      source: 'chat',
    },
    {
      type: 'insight',
      title: 'Questions are grounded in your sources',
      description: 'All answers reference your uploaded materials, not generic information',
      priority: 'low',
      source: 'chat',
    },
    {
      type: 'next-step',
      title: 'Try multi-source questions',
      description: 'Ask questions that span multiple documents to see connections',
      priority: 'low',
      source: 'chat',
    },
  ],
  '/council': [
    {
      type: 'insight',
      title: 'Standards Guardian for curriculum questions',
      description: 'Best for checking alignment, sequencing, and coverage of standards',
      priority: 'high',
      source: 'council',
    },
    {
      type: 'insight',
      title: 'Differentiation Advocate for student needs',
      description: 'Get advice on supporting diverse learners and scaffolding',
      priority: 'high',
      source: 'council',
    },
    {
      type: 'insight',
      title: 'Practical Realist for time management',
      description: 'Realistic feedback on workload and classroom practicality',
      priority: 'medium',
      source: 'council',
    },
    {
      type: 'insight',
      title: 'Assessment Architect for evaluation',
      description: 'Expert guidance on grading, feedback, and student assessment',
      priority: 'medium',
      source: 'council',
    },
  ],
}

// Default suggestions for any route
const DEFAULT_SUGGESTIONS: Omit<Suggestion, 'id' | 'timestamp'>[] = [
  {
    type: 'insight',
    title: 'Use keyboard shortcuts',
    description: 'Cmd+. for assistant, Cmd+/ for help, Cmd+K for commands',
    priority: 'low',
    source: 'system',
  },
]

export async function generateSuggestions(context: SuggestionContext): Promise<Suggestion[]> {
  const { currentRoute } = context
  const suggestions: Suggestion[] = []

  // Get route-specific suggestions
  const routeSuggestions = ROUTE_SUGGESTIONS[currentRoute] || []

  // Add route-specific suggestions
  routeSuggestions.forEach((suggestion, index) => {
    suggestions.push({
      ...suggestion,
      id: `${currentRoute}-${index}`,
      timestamp: new Date(),
    })
  })

  // Try to fetch data-driven suggestions
  try {
    const dataSuggestions = await fetchDataDrivenSuggestions(currentRoute)
    suggestions.push(...dataSuggestions)
  } catch (error) {
    console.error('Failed to fetch data-driven suggestions:', error)
  }

  // Add default suggestions if we have few
  if (suggestions.length < 2) {
    DEFAULT_SUGGESTIONS.forEach((suggestion, index) => {
      suggestions.push({
        ...suggestion,
        id: `default-${index}`,
        timestamp: new Date(),
      })
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return suggestions.slice(0, 5) // Limit to 5 suggestions for teachers
}

async function fetchDataDrivenSuggestions(currentRoute: string): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = []

  try {
    // Check if teacher has uploaded any sources
    const sourcesRes = await fetch('/api/v1/sources/')
    if (sourcesRes.ok) {
      const sources = await sourcesRes.json()
      if (Array.isArray(sources) && sources.length === 0 && currentRoute !== '/sources') {
        suggestions.push({
          id: 'data-no-sources',
          type: 'action',
          title: 'No curriculum sources yet',
          description: 'Upload your first document to start using TeachAssist',
          actionLabel: 'Upload Sources',
          priority: 'high',
          source: 'data',
          timestamp: new Date(),
        })
      }
    }

    // Check for chat history
    const chatRes = await fetch('/api/v1/chat/history')
    if (chatRes.ok) {
      const history = await chatRes.json()
      if (Array.isArray(history) && history.length === 0 && currentRoute === '/chat') {
        suggestions.push({
          id: 'data-no-chats',
          type: 'next-step',
          title: 'Ask your first question',
          description: 'Try "What standards do I need to cover in [subject]?"',
          priority: 'medium',
          source: 'data',
          timestamp: new Date(),
        })
      }
    }
  } catch (error) {
    // Silently fail - data suggestions are optional
  }

  return suggestions
}
