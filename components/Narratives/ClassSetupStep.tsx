'use client'

import { useState, useEffect } from 'react'
import { useNarrativesStore } from '@/stores/narrativesStore'
import { BookOpen, Check, Loader2, ArrowRight, ChevronDown } from 'lucide-react'

export function ClassSetupStep() {
  const {
    className,
    semester,
    rubricLoaded,
    rubricCriteria,
    rubricTemplates,
    selectedRubricTemplateId,
    setClassInfo,
    loadRubric,
    loadRubricTemplates,
    selectRubricTemplate,
    nextStep,
  } = useNarrativesStore()

  const [localClassName, setLocalClassName] = useState(className)
  const [localSemester, setLocalSemester] = useState(semester)
  const [isLoadingRubric, setIsLoadingRubric] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  useEffect(() => {
    if (rubricTemplates.length === 0) {
      setIsLoadingTemplates(true)
      loadRubricTemplates().finally(() => setIsLoadingTemplates(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadLegacyRubric = async () => {
    setIsLoadingRubric(true)
    await loadRubric()
    setIsLoadingRubric(false)
  }

  const handleTemplateSelect = (templateId: string) => {
    selectRubricTemplate(templateId)
  }

  const handleNext = () => {
    setClassInfo(localClassName, localSemester)
    nextStep()
  }

  const canProceed = localClassName.trim() && localSemester.trim()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Class Setup</h2>
        <p className="text-gray-400 text-sm">
          Enter your class information and select a rubric template.
        </p>
      </div>

      {/* Class Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-300 mb-2">
            Class Name
          </label>
          <input
            id="className"
            type="text"
            value={localClassName}
            onChange={(e) => setLocalClassName(e.target.value)}
            placeholder="e.g., Science 6A"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-300 mb-2">
            Semester
          </label>
          <input
            id="semester"
            type="text"
            value={localSemester}
            onChange={(e) => setLocalSemester(e.target.value)}
            placeholder="e.g., Fall 2025"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rubric Template Selector */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Rubric Template</h3>
            <p className="text-gray-400 text-sm">
              Select a subject rubric for criteria scoring
            </p>
          </div>
          {rubricLoaded && (
            <div className="ml-auto flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Loaded</span>
            </div>
          )}
        </div>

        {isLoadingTemplates ? (
          <div className="flex items-center gap-2 text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading rubric templates...</span>
          </div>
        ) : rubricTemplates.length > 0 ? (
          <div className="space-y-3">
            <div className="relative">
              <select
                value={selectedRubricTemplateId || ''}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a rubric template...</option>
                {rubricTemplates.map((template) => (
                  <option key={template.template_id} value={template.template_id}>
                    {template.name} — {template.subject}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Selected template description */}
            {selectedRubricTemplateId && rubricTemplates.find(t => t.template_id === selectedRubricTemplateId) && (
              <p className="text-gray-400 text-xs px-1">
                {rubricTemplates.find(t => t.template_id === selectedRubricTemplateId)?.description}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">
              Could not load templates from server. Use legacy loader:
            </p>
            <button
              onClick={handleLoadLegacyRubric}
              disabled={isLoadingRubric || rubricLoaded}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isLoadingRubric ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : rubricLoaded ? (
                <>
                  <Check className="w-4 h-4" />
                  Loaded
                </>
              ) : (
                'Load IB MYP Science'
              )}
            </button>
          </div>
        )}

        {/* Rubric Criteria Display */}
        {rubricLoaded && rubricCriteria.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {rubricCriteria.map((criterion) => (
              <div
                key={criterion.id}
                className="bg-gray-900 rounded-lg p-3 border border-gray-700"
              >
                <div className="text-indigo-400 font-medium text-sm">
                  {criterion.id.split('_')[0].toUpperCase()}
                </div>
                <div className="text-gray-300 text-xs mt-1 line-clamp-2">
                  {criterion.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-gray-800">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Next: Add Students
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
