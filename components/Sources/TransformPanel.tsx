/**
 * TransformPanel - Apply AI transformations to sources
 *
 * Transforms content in various ways:
 * - summarize: Create summary with audience/length options
 * - extract_misconceptions: Find common student misconceptions
 * - map_standards: Map content to educational standards
 * - generate_questions: Create discussion questions
 * - simplify_language: Reduce reading level
 */

'use client'

import { useState } from 'react'
import {
  Sparkles,
  FileText,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Loader2,
  Copy,
  Check,
  X,
  ChevronDown,
} from 'lucide-react'
import api, { TransformType, TransformOptions, TransformResponse } from '@/lib/api'

interface TransformPanelProps {
  sourceId?: string
  sourceName?: string
  onClose?: () => void
}

interface TransformConfig {
  id: TransformType
  name: string
  description: string
  icon: React.ReactNode
  options?: {
    audience?: boolean
    length?: boolean
    count?: boolean
    grade_level?: boolean
  }
}

const TRANSFORMS: TransformConfig[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a clear, concise summary of the content',
    icon: <FileText className="w-4 h-4" />,
    options: { audience: true, length: true },
  },
  {
    id: 'extract_misconceptions',
    name: 'Extract Misconceptions',
    description: 'Identify common student misconceptions in this content',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: 'map_standards',
    name: 'Map to Standards',
    description: 'Identify which educational standards this content addresses',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: 'generate_questions',
    name: 'Generate Questions',
    description: 'Create discussion questions for deeper understanding',
    icon: <HelpCircle className="w-4 h-4" />,
    options: { count: true },
  },
  {
    id: 'simplify_language',
    name: 'Simplify Language',
    description: 'Rewrite at a lower reading level while preserving concepts',
    icon: <GraduationCap className="w-4 h-4" />,
    options: { grade_level: true },
  },
]

const AUDIENCE_OPTIONS = [
  { value: 'teachers', label: 'Teachers' },
  { value: 'students', label: 'Students' },
]

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (1-2 paragraphs)' },
  { value: 'medium', label: 'Medium (3-5 paragraphs)' },
  { value: 'long', label: 'Long (detailed)' },
]

const QUESTION_COUNT_OPTIONS = [
  { value: 3, label: '3 questions' },
  { value: 5, label: '5 questions' },
  { value: 10, label: '10 questions' },
]

const GRADE_LEVEL_OPTIONS = [
  { value: '3rd grade', label: '3rd Grade' },
  { value: '5th grade', label: '5th Grade' },
  { value: '6th grade', label: '6th Grade' },
  { value: '8th grade', label: '8th Grade' },
]

export function TransformPanel({ sourceId, sourceName, onClose }: TransformPanelProps) {
  const [selectedTransform, setSelectedTransform] = useState<TransformType>('summarize')
  const [options, setOptions] = useState<TransformOptions>({
    audience: 'teachers',
    length: 'medium',
    count: 5,
    grade_level: '6th grade',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TransformResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [showTransformDropdown, setShowTransformDropdown] = useState(false)

  const currentTransform = TRANSFORMS.find(t => t.id === selectedTransform)

  const handleTransform = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    const transformOptions: TransformOptions = {}

    // Only include relevant options for the selected transform
    if (currentTransform?.options?.audience) {
      transformOptions.audience = options.audience
    }
    if (currentTransform?.options?.length) {
      transformOptions.length = options.length
    }
    if (currentTransform?.options?.count) {
      transformOptions.count = options.count
    }
    if (currentTransform?.options?.grade_level) {
      transformOptions.grade_level = options.grade_level
    }

    const response = await api.chat.transform(
      selectedTransform,
      sourceId ? [sourceId] : undefined,
      transformOptions
    )

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setResult(response.data)
    }

    setLoading(false)
  }

  const handleCopy = async () => {
    if (result?.result) {
      try {
        await navigator.clipboard.writeText(result.result)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = result.result
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-gray-900 dark:text-white font-medium">Transform Source</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Source indicator */}
      {sourceName && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-500 dark:text-gray-400">Source:</span>
            <span className="text-gray-900 dark:text-white truncate">{sourceName}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Transform selector */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-500 dark:text-gray-400">Transform Type</label>
          <div className="relative">
            <button
              onClick={() => setShowTransformDropdown(!showTransformDropdown)}
              className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                {currentTransform?.icon}
                <span>{currentTransform?.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showTransformDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showTransformDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {TRANSFORMS.map((transform) => (
                  <button
                    key={transform.id}
                    onClick={() => {
                      setSelectedTransform(transform.id)
                      setShowTransformDropdown(false)
                      setResult(null)
                      setError(null)
                    }}
                    className={`w-full px-3 py-2.5 text-left flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      selectedTransform === transform.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      selectedTransform === transform.id ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {transform.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 dark:text-white font-medium">{transform.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{transform.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transform-specific options */}
        {currentTransform?.options && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-300/50 dark:border-gray-700/50">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Options</div>

            {currentTransform.options.audience && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-500 dark:text-gray-400">Target Audience</label>
                <div className="flex gap-2">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setOptions({ ...options, audience: opt.value as 'students' | 'teachers' })}
                      disabled={loading}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        options.audience === opt.value
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentTransform.options.length && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-500 dark:text-gray-400">Summary Length</label>
                <select
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: e.target.value as 'short' | 'medium' | 'long' })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {LENGTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {currentTransform.options.count && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-500 dark:text-gray-400">Number of Questions</label>
                <select
                  value={options.count}
                  onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {QUESTION_COUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {currentTransform.options.grade_level && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-500 dark:text-gray-400">Target Reading Level</label>
                <select
                  value={options.grade_level}
                  onChange={(e) => setOptions({ ...options, grade_level: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {GRADE_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Transform Result
                {result.sources_used.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({result.sources_used.length} sources used)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm font-sans leading-relaxed">
                  {result.result}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Apply button */}
        {!result && (
          <button
            onClick={handleTransform}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Apply Transform
              </>
            )}
          </button>
        )}

        {/* Transform again button when result is shown */}
        {result && (
          <button
            onClick={handleTransform}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-gray-900 dark:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Transform Again
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default TransformPanel
