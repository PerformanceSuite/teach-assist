/**
 * Inner Council Page - Consult specialized teaching advisors
 */

'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import api from '@/lib/api'

interface Persona {
  id: string
  name: string
  description: string
}

export default function CouncilPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<string>('')
  const [context, setContext] = useState('')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load personas on mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const result = await api.council.listPersonas()

        if (result.error) {
          setError(result.error)
          setLoadingPersonas(false)
          return
        }

        const personaList = result.data || []
        setPersonas(personaList)
        if (personaList.length > 0) {
          setSelectedPersona(personaList[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load personas')
      } finally {
        setLoadingPersonas(false)
      }
    }

    loadPersonas()
  }, [])

  const handleConsult = async () => {
    if (!selectedPersona || !context.trim() || !question.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await api.council.consult(selectedPersona, context.trim(), question.trim())

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.data?.advice) {
        setResponse(result.data.advice)
      } else {
        setError('No advice received from advisor')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Consultation failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedPersonaDetails = personas.find(p => p.id === selectedPersona)

  return (
    <div className="h-full overflow-auto p-6 bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Inner Council</h1>
          </div>
          <p className="text-gray-400 max-w-3xl">
            Consult specialized teaching advisors for expert guidance on curriculum design,
            differentiation, assessment, and standards alignment.
          </p>
        </div>

        {/* Persona Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Select Advisor
          </label>
          {loadingPersonas ? (
            <div className="text-sm text-gray-500">Loading advisors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personas.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`text-left rounded-lg border-2 p-4 transition-colors ${
                    selectedPersona === persona.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-800 hover:border-gray-600 bg-gray-900/50'
                  }`}
                >
                  <div className="font-semibold text-white">{persona.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{persona.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Persona Details */}
        {selectedPersonaDetails && (
          <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
            <div className="text-sm font-medium text-white mb-2">
              Selected Advisor:
            </div>
            <div className="text-sm text-gray-300">
              {selectedPersonaDetails.description}
            </div>
          </div>
        )}

        {/* Context Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Teaching Context
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Describe your lesson, unit, or teaching situation... (e.g., 'Grade 8 physics lesson on Newton's Laws, mixed-ability class, 45-minute period')"
            className="w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-sm text-white placeholder-gray-500 resize-none focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            rows={4}
            disabled={loading}
          />
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Your Question
          </label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What specific guidance do you need? (e.g., 'How can I differentiate this lesson for struggling learners while maintaining rigor?')"
            className="w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-sm text-white placeholder-gray-500 resize-none focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Consult Button */}
        <button
          onClick={handleConsult}
          disabled={loading || !context.trim() || !question.trim()}
          className="w-full rounded-md bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Consulting...' : 'Get Advice'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-800" />
              <div className="text-sm font-medium text-gray-400">
                Advice from {selectedPersonaDetails?.name}
              </div>
              <div className="h-px flex-1 bg-gray-800" />
            </div>
            <div className="rounded-lg border-2 border-purple-500/50 bg-purple-500/10 p-6">
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                  {response}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/50 p-4 text-sm text-blue-400">
          <div className="font-medium mb-1">💡 Best Practices</div>
          <ul className="space-y-1 ml-4 list-disc text-gray-400">
            <li>Provide detailed context about your teaching situation</li>
            <li>Ask specific questions rather than general ones</li>
            <li>Try different advisors for different perspectives</li>
            <li>Use the advice as a starting point, then adapt to your students</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
