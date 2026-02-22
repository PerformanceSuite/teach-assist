'use client'

import { useState, useEffect } from 'react'
import { useGradeStore } from '@/stores/gradeStore'
import { BookOpen, ArrowRight, ChevronDown, Loader2 } from 'lucide-react'

export function SetupStep() {
  const {
    assignmentName,
    assignmentContext,
    selectedRubricTemplateId,
    rubricTemplates,
    setAssignmentInfo,
    setRubricTemplateId,
    loadRubricTemplates,
    nextStep,
  } = useGradeStore()

  const [localName, setLocalName] = useState(assignmentName)
  const [localContext, setLocalContext] = useState(assignmentContext)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  useEffect(() => {
    if (rubricTemplates.length === 0) {
      setIsLoadingTemplates(true)
      loadRubricTemplates().finally(() => setIsLoadingTemplates(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    setAssignmentInfo(localName, localContext)
    nextStep()
  }

  const canProceed = localName.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Assignment Setup</h2>
        <p className="text-gray-400 text-sm">
          Describe the assignment and optionally select a rubric for criteria-aligned feedback.
        </p>
      </div>

      {/* Assignment Info */}
      <div className="space-y-4">
        <div>
          <label htmlFor="assignmentName" className="block text-sm font-medium text-gray-300 mb-2">
            Assignment Name
          </label>
          <input
            id="assignmentName"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="e.g., Forces Lab Report"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="assignmentContext" className="block text-sm font-medium text-gray-300 mb-2">
            Assignment Context <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            id="assignmentContext"
            value={localContext}
            onChange={(e) => setLocalContext(e.target.value)}
            placeholder="Describe what students were asked to do, learning objectives, etc."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Rubric Template Selector */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Rubric Template</h3>
            <p className="text-gray-400 text-sm">Optional — align feedback to specific criteria</p>
          </div>
        </div>

        {isLoadingTemplates ? (
          <div className="flex items-center gap-2 text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading templates...</span>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedRubricTemplateId || ''}
              onChange={(e) => setRubricTemplateId(e.target.value || null)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">No rubric (general feedback)</option>
              {rubricTemplates.map((template) => (
                <option key={template.template_id} value={template.template_id}>
                  {template.name} — {template.subject}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-gray-800">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Next: Add Submissions
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
