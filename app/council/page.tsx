/**
 * Inner Council Page - Consult specialized teaching advisors
 */

'use client'

import { useState, useEffect } from 'react'
import { consultCouncil, getPersonas } from '@/lib/api'

interface Persona {
  id: string
  name: string
  role: string
  expertise: string[]
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
        const result = await getPersonas()
        setPersonas(result.personas)
        if (result.personas.length > 0) {
          setSelectedPersona(result.personas[0].id)
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
      const result = await consultCouncil(selectedPersona, context.trim(), question.trim())
      // Extract the first advisor's response
      if (result.advice && result.advice.length > 0) {
        const advice = result.advice[0].response
        setResponse(advice.raw_text || advice.observations.join('\n'))
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
    <div className="h-full overflow-auto p-6 bg-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Inner Council</h1>
          <p className="text-sm text-neutral-600">
            Consult specialized teaching advisors for expert guidance on curriculum design,
            differentiation, assessment, and standards alignment.
          </p>
        </div>

        {/* Persona Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-900">
            Select Advisor
          </label>
          {loadingPersonas ? (
            <div className="text-sm text-neutral-500">Loading advisors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personas.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`text-left rounded-lg border-2 p-4 transition-colors ${
                    selectedPersona === persona.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-semibold text-neutral-900">{persona.name}</div>
                  <div className="text-sm text-neutral-600 mt-1">{persona.role}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {persona.expertise.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Persona Details */}
        {selectedPersonaDetails && (
          <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
            <div className="text-sm font-medium text-neutral-900 mb-2">
              {selectedPersonaDetails.name} specializes in:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPersonaDetails.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white border border-neutral-300 text-neutral-700 px-2 py-1 rounded"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Context Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-900">
            Teaching Context
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Describe your lesson, unit, or teaching situation... (e.g., 'Grade 8 physics lesson on Newton's Laws, mixed-ability class, 45-minute period')"
            className="w-full rounded-md border border-neutral-300 p-3 text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={4}
            disabled={loading}
          />
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-900">
            Your Question
          </label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What specific guidance do you need? (e.g., 'How can I differentiate this lesson for struggling learners while maintaining rigor?')"
            className="w-full rounded-md border border-neutral-300 p-3 text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Consult Button */}
        <button
          onClick={handleConsult}
          disabled={loading || !context.trim() || !question.trim()}
          className="w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Consulting...' : 'Get Advice'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-neutral-200" />
              <div className="text-sm font-medium text-neutral-600">
                Advice from {selectedPersonaDetails?.name}
              </div>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-neutral-800 leading-relaxed">
                  {response}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <div className="font-medium mb-1">💡 Best Practices</div>
          <ul className="space-y-1 ml-4 list-disc">
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
