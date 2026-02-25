'use client'

import { useState, useEffect, useCallback, KeyboardEvent } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import type { StudentProfile } from '@/lib/api'

interface StudentFormProps {
  isOpen: boolean
  onClose: () => void
  student?: StudentProfile | null
  onSave: (data: { name: string; interests: string[]; accommodations: string[] }) => Promise<void>
  isSaving?: boolean
}

export function StudentForm({ isOpen, onClose, student, onSave, isSaving = false }: StudentFormProps) {
  const [name, setName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [interestInput, setInterestInput] = useState('')
  const [accommodations, setAccommodations] = useState<string[]>([])
  const [accommodationInput, setAccommodationInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Populate form when editing
  useEffect(() => {
    if (student) {
      setName(student.name)
      setInterests(student.interests || [])
      setAccommodations(student.accommodations || [])
    } else {
      setName('')
      setInterests([])
      setAccommodations([])
    }
    setInterestInput('')
    setAccommodationInput('')
    setError(null)
  }, [student, isOpen])

  const handleAddInterest = useCallback(() => {
    const trimmed = interestInput.trim()
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed])
      setInterestInput('')
    }
  }, [interestInput, interests])

  const handleAddAccommodation = useCallback(() => {
    const trimmed = accommodationInput.trim()
    if (trimmed && !accommodations.includes(trimmed)) {
      setAccommodations((prev) => [...prev, trimmed])
      setAccommodationInput('')
    }
  }, [accommodationInput, accommodations])

  const handleInterestKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddInterest()
    }
  }

  const handleAccommodationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddAccommodation()
    }
  }

  const handleRemoveInterest = (index: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveAccommodation = (index: number) => {
    setAccommodations((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    try {
      await onSave({
        name: name.trim(),
        interests,
        accommodations,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-700 p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {student ? 'Edit Student' : 'Add Student'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Use initials or nickname (e.g., Alex M.)"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Use anonymized names only - no full names or PII
            </p>
          </div>

          {/* Interests field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interests
            </label>
            <div className="space-y-3">
              {/* Interest input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  placeholder="soccer, music, gaming..."
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  disabled={!interestInput.trim()}
                  className="px-3 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Interest tags */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(index)}
                        className="hover:text-blue-100 dark:hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Helps personalize explanations with relatable examples
              </p>
            </div>
          </div>

          {/* Accommodations field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accommodations <span className="text-purple-400 text-xs">(IEP/504)</span>
            </label>
            <div className="space-y-3">
              {/* Accommodation input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accommodationInput}
                  onChange={(e) => setAccommodationInput(e.target.value)}
                  onKeyDown={handleAccommodationKeyDown}
                  placeholder="extended time, visual supports..."
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddAccommodation}
                  disabled={!accommodationInput.trim()}
                  className="px-3 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Accommodation tags */}
              {accommodations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {accommodations.map((accommodation, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      {accommodation}
                      <button
                        type="button"
                        onClick={() => handleRemoveAccommodation(index)}
                        className="hover:text-purple-100 dark:hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                AI will adapt responses for these needs (e.g., simpler language, step-by-step)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                student ? 'Update Student' : 'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
