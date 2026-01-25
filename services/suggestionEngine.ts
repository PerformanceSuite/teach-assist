/**
 * Suggestion Engine - Generates context-aware suggestions
 */

import { Suggestion } from '../stores/aiAssistantStore'

interface SuggestionContext {
  currentRoute: string
  recentActions: string[]
}

// Route-specific suggestions for teachers
const ROUTE_SUGGESTIONS: Record<string, Omit<Suggestion, 'id' | 'timestamp'>[]> = {
  '/': [
    {
      type: 'action',
      title: 'Upload your first document',
      description: 'Add curriculum standards, lesson plans, or teaching materials',
      actionLabel: 'Upload Sources',
      priority: 'high',
      source: 'welcome',
    },
    {
      type: 'next-step',
      title: 'Try asking a question',
      description: 'Get grounded answers from your uploaded sources',
      actionLabel: 'Start Chat',
      priority: 'medium',
      source: 'welcome',
    },
  ],
  '/sources': [
    {
      type: 'insight',
      title: 'Knowledge base tip',
      description: 'Upload curriculum standards for better alignment advice from your Inner Council',
      priority: 'low',
      source: 'sources',
    },
    {
      type: 'action',
      title: 'Upload more documents',
      description: 'Add lesson plans, IEPs, or teaching materials for richer context',
      priority: 'medium',
      source: 'sources',
    },
  ],
  '/chat': [
    {
      type: 'insight',
      title: 'Grounded responses',
      description: 'All answers cite your uploaded sources - no hallucinations',
      priority: 'low',
      source: 'chat',
    },
    {
      type: 'reminder',
      title: 'Ask about standards alignment',
      description: 'Check if your lesson plans align with curriculum standards',
      priority: 'medium',
      source: 'chat',
    },
  ],
  '/council': [
    {
      type: 'insight',
      title: 'Choose your advisor',
      description: 'Standards Guardian for alignment, Differentiation Architect for accommodations',
      priority: 'medium',
      source: 'council',
    },
    {
      type: 'action',
      title: 'Consult the council',
      description: 'Get structured advice on lesson planning or student support',
      actionLabel: 'Consult Council',
      priority: 'high',
      source: 'council',
    },
  ],
}

// Default suggestions for any route
const DEFAULT_SUGGESTIONS: Omit<Suggestion, 'id' | 'timestamp'>[] = [
  {
    type: 'insight',
    title: 'Use keyboard shortcuts',
    description: 'Cmd+. for AI Assistant, Cmd+/ for Help Center, Cmd+K for commands',
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
  if (suggestions.length < 3) {
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

  return suggestions.slice(0, 6) // Limit to 6 suggestions
}

async function fetchDataDrivenSuggestions(currentRoute: string): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = []
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

  try {
    // Fetch sources to check for empty state
    const sourcesRes = await fetch(`${API_BASE}/api/v1/sources/list`)
    if (sourcesRes.ok) {
      const data = await sourcesRes.json()
      const sources = data.sources || []
      if (Array.isArray(sources) && sources.length === 0) {
        suggestions.push({
          id: 'data-no-sources',
          type: 'action',
          title: 'No documents uploaded yet',
          description: 'Upload curriculum standards or lesson plans to get started',
          actionLabel: 'Upload Sources',
          priority: 'high',
          source: 'data',
          timestamp: new Date(),
        })
      } else if (sources.length > 0 && sources.length < 3) {
        suggestions.push({
          id: 'data-few-sources',
          type: 'reminder',
          title: 'Build your knowledge base',
          description: 'Upload more teaching materials for richer context',
          actionLabel: 'Upload Sources',
          priority: 'medium',
          source: 'data',
          timestamp: new Date(),
        })
      }
    }

    // Check knowledge base stats
    const statsRes = await fetch(`${API_BASE}/api/v1/sources/stats`)
    if (statsRes.ok) {
      const stats = await statsRes.json()
      if (stats.total_documents > 0 && stats.total_chunks === 0) {
        suggestions.push({
          id: 'data-no-chunks',
          type: 'reminder',
          title: 'Documents need processing',
          description: 'Your uploaded documents are being indexed',
          priority: 'medium',
          source: 'data',
          timestamp: new Date(),
        })
      }
    }

    // TODO: Add chat history suggestions when endpoint is ready
    // TODO: Add council consultation reminders when endpoint is ready
  } catch (error) {
    // Silently fail - data suggestions are optional
  }

  return suggestions
}
