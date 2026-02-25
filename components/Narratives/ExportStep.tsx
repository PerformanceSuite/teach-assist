'use client'

import { useState } from 'react'
import { useNarrativesStore } from '@/stores/narrativesStore'
import {
  ArrowLeft,
  Download,
  Copy,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  FileJson,
  RefreshCw,
} from 'lucide-react'

type ExportFormat = 'txt' | 'csv' | 'json'

const FORMAT_OPTIONS = [
  {
    value: 'txt' as ExportFormat,
    label: 'Plain Text',
    description: 'Best for ISAMS copy-paste',
    icon: FileText,
    recommended: true,
  },
  {
    value: 'csv' as ExportFormat,
    label: 'CSV',
    description: 'Spreadsheet format',
    icon: FileSpreadsheet,
  },
  {
    value: 'json' as ExportFormat,
    label: 'JSON',
    description: 'Full data for archival',
    icon: FileJson,
  },
]

export function ExportStep() {
  const { narratives, className, semester, exportNarratives, reset, prevStep } =
    useNarrativesStore()

  const [format, setFormat] = useState<ExportFormat>('txt')
  const [approvedOnly, setApprovedOnly] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const approvedCount = narratives.filter((n) => n.status === 'approved').length

  const handleExport = async () => {
    setIsExporting(true)
    const data = await exportNarratives(format, approvedOnly)
    if (data) {
      setPreview(data)
    }
    setIsExporting(false)
  }

  const handleDownload = () => {
    if (!preview) return

    const blob = new Blob([preview], {
      type: format === 'json' ? 'application/json' : 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${className.replace(/\s+/g, '_')}_${semester.replace(/\s+/g, '_')}_narratives.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!preview) return
    await navigator.clipboard.writeText(preview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartNew = () => {
    if (window.confirm('Start a new batch? This will clear all current data.')) {
      reset()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Export Narratives</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Download narratives for {className} in your preferred format.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{narratives.length}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Total</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Approved</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {narratives.length - approvedCount}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Pending</div>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setFormat(opt.value)
                  setPreview(null)
                }}
                className={`relative text-left p-4 rounded-lg border-2 transition-colors ${
                  format === opt.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {opt.recommended && (
                  <span className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                    Recommended
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{opt.label}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{opt.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="approvedOnly"
          checked={approvedOnly}
          onChange={(e) => {
            setApprovedOnly(e.target.checked)
            setPreview(null)
          }}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900"
        />
        <label htmlFor="approvedOnly" className="text-gray-700 dark:text-gray-300 text-sm cursor-pointer">
          Include only approved narratives ({approvedCount} of {narratives.length})
        </label>
      </div>

      {/* Generate Preview Button */}
      {!preview && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Generate Export
            </>
          )}
        </button>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 dark:text-white font-medium">Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-4 max-h-96 overflow-auto">
            <pre className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap font-mono">
              {preview.slice(0, 2000)}
              {preview.length > 2000 && (
                <span className="text-gray-500">
                  {'\n\n'}... ({preview.length - 2000} more characters)
                </span>
              )}
            </pre>
          </div>

          <button
            onClick={() => setPreview(null)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
          >
            ← Change format or options
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </button>
        <button
          onClick={handleStartNew}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Start New Batch
        </button>
      </div>
    </div>
  )
}
