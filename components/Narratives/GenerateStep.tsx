'use client'

import { useNarrativesStore } from '@/stores/narrativesStore'
import { ArrowLeft, Sparkles, Loader2, Users, AlertCircle } from 'lucide-react'

const TONE_OPTIONS = [
  { value: 'encouraging', label: 'Encouraging', description: 'Highlight strengths, frame growth as opportunities' },
  { value: 'neutral', label: 'Neutral', description: 'Objective observations, direct presentation' },
  { value: 'direct', label: 'Direct', description: 'Focus on evidence and actionable next steps' },
]

export function GenerateStep() {
  const {
    students,
    className,
    semester,
    options,
    setOptions,
    isGenerating,
    progress,
    generationError,
    generateNarratives,
    prevStep,
  } = useNarrativesStore()

  const handleToneChange = (tone: 'encouraging' | 'neutral' | 'direct') => {
    setOptions({ tone })
  }

  const handleGrowthAreaChange = (checked: boolean) => {
    setOptions({ include_growth_area: checked })
  }

  const handleCouncilReviewChange = (persona: string, checked: boolean) => {
    const currentReviews = options.council_review || []
    if (checked) {
      setOptions({ council_review: [...currentReviews, persona] })
    } else {
      setOptions({ council_review: currentReviews.filter((p) => p !== persona) })
    }
  }

  const progressPercent = progress ? Math.round((progress.completed / progress.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Generate Narratives</h2>
        <p className="text-gray-400 text-sm">
          Configure options and generate personalized narratives for your students.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">
              {students.length} student{students.length !== 1 ? 's' : ''} ready for synthesis
            </h3>
            <p className="text-blue-300 text-sm">
              {className} &bull; {semester}
            </p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-6">
        {/* Tone Selection */}
        <div>
          <h3 className="text-white font-medium mb-3">Narrative Tone</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleToneChange(opt.value as 'encouraging' | 'neutral' | 'direct')}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  options.tone === opt.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="text-white font-medium">{opt.label}</div>
                <div className="text-gray-400 text-sm mt-1">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Growth Area */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="growthArea"
            checked={options.include_growth_area}
            onChange={(e) => handleGrowthAreaChange(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
          />
          <label htmlFor="growthArea" className="cursor-pointer">
            <div className="text-white font-medium">Include growth area</div>
            <div className="text-gray-400 text-sm">
              Add a sentence identifying an actionable area for development based on lowest criterion
            </div>
          </label>
        </div>

        {/* Council Review */}
        <div>
          <h3 className="text-white font-medium mb-3">Council Review (Optional)</h3>
          <p className="text-gray-400 text-sm mb-3">
            Have advisory personas review each narrative for quality and equity.
          </p>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="equityAdvocate"
              checked={options.council_review?.includes('equity-advocate') || false}
              onChange={(e) => handleCouncilReviewChange('equity-advocate', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="equityAdvocate" className="cursor-pointer">
              <div className="text-white font-medium">Equity Advocate</div>
              <div className="text-gray-400 text-sm">
                Ensure narratives are inclusive and avoid unintended bias
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {generationError && (
        <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 font-medium">Generation failed</div>
            <div className="text-red-300 text-sm mt-1">{generationError}</div>
          </div>
        </div>
      )}

      {/* Progress Display with Skeletons */}
      {isGenerating && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-white font-medium">
                {progress
                  ? `Generating narratives... ${progress.completed}/${progress.total}`
                  : 'Starting generation...'}
              </span>
            </div>
            {progress && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            <p className="text-gray-400 text-sm mt-3">
              {students.length > 10
                ? 'Large batch processing may take a few minutes. You can wait or check back later.'
                : 'This usually takes about 30 seconds.'}
            </p>
          </div>

          {/* Loading skeletons */}
          <div className="space-y-3">
            {Array.from({ length: Math.min(students.length, 3) }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-8 bg-gray-700 rounded" />
                  <div className="w-16 h-5 bg-gray-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-700 rounded w-5/6" />
                  <div className="h-3 bg-gray-700 rounded w-4/6" />
                  <div className="h-3 bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-800">
        <button
          onClick={prevStep}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={generateNarratives}
          disabled={isGenerating || students.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Narratives
            </>
          )}
        </button>
      </div>
    </div>
  )
}
