'use client'

import { useState } from 'react'
import { useNarrativesStore } from '@/stores/narrativesStore'
import { BookOpen, Check, Loader2, ArrowRight } from 'lucide-react'

export function ClassSetupStep() {
  const {
    className,
    semester,
    rubricLoaded,
    rubricCriteria,
    setClassInfo,
    loadRubric,
    nextStep,
  } = useNarrativesStore()

  const [localClassName, setLocalClassName] = useState(className)
  const [localSemester, setLocalSemester] = useState(semester)
  const [isLoadingRubric, setIsLoadingRubric] = useState(false)

  const handleLoadRubric = async () => {
    setIsLoadingRubric(true)
    await loadRubric()
    setIsLoadingRubric(false)
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
          Enter your class information and load the IB MYP Science rubric.
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

      {/* IB Rubric Section */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">IB MYP Science Rubric</h3>
              <p className="text-gray-400 text-sm">
                Load criteria A-D for scoring (1-8 scale)
              </p>
            </div>
          </div>

          {rubricLoaded ? (
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Loaded</span>
            </div>
          ) : (
            <button
              onClick={handleLoadRubric}
              disabled={isLoadingRubric}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isLoadingRubric ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Rubric'
              )}
            </button>
          )}
        </div>

        {/* Rubric Criteria Display */}
        {rubricLoaded && rubricCriteria.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {rubricCriteria.map((criterion) => (
              <div
                key={criterion.id}
                className="bg-gray-900 rounded-lg p-3 border border-gray-700"
              >
                <div className="text-indigo-400 font-medium text-sm">
                  {criterion.id.replace('_', ': ').toUpperCase()}
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
