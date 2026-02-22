'use client'

import { useState } from 'react'
import { useGradeStore } from '@/stores/gradeStore'
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  FileText,
  Table,
  Code,
  RotateCcw,
} from 'lucide-react'

const FORMAT_OPTIONS = [
  { value: 'txt' as const, label: 'Plain Text', description: 'For copy-paste into ISAMS or other systems', icon: FileText },
  { value: 'csv' as const, label: 'CSV', description: 'Spreadsheet format with student ID and feedback', icon: Table },
  { value: 'json' as const, label: 'JSON', description: 'Full data for archival or integration', icon: Code },
]

export function ExportStep() {
  const {
    feedback,
    assignmentName,
    exportFeedback,
    prevStep,
    reset,
  } = useGradeStore()

  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'csv' | 'json'>('txt')
  const [approvedOnly, setApprovedOnly] = useState(false)
  const [exported, setExported] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const approvedCount = feedback.filter(f => f.status === 'approved' || f.status === 'edited').length
  const totalCount = feedback.length

  const handleExport = async () => {
    const result = await exportFeedback(selectedFormat, approvedOnly)
    if (result) {
      setExported(result)
    }
  }

  const handleCopy = async () => {
    if (exported) {
      await navigator.clipboard.writeText(exported)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!exported) return
    const blob = new Blob([exported], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feedback_${assignmentName.replace(/\s+/g, '_')}.${selectedFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Export Feedback</h2>
        <p className="text-gray-400 text-sm">
          Export feedback for &ldquo;{assignmentName}&rdquo; in your preferred format.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white">{totalCount}</div>
          <div className="text-gray-400 text-sm">Total</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-emerald-400">{approvedCount}</div>
          <div className="text-gray-400 text-sm">Approved</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalCount - approvedCount}</div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <h3 className="text-white font-medium">Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FORMAT_OPTIONS.map(opt => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                onClick={() => { setSelectedFormat(opt.value); setExported(null) }}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedFormat === opt.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 text-white font-medium">
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </div>
                <div className="text-gray-400 text-sm mt-1">{opt.description}</div>
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
          onChange={(e) => { setApprovedOnly(e.target.checked); setExported(null) }}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900"
        />
        <label htmlFor="approvedOnly" className="text-gray-300 text-sm cursor-pointer">
          Export approved feedback only
        </label>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Generate Export
      </button>

      {/* Preview */}
      {exported && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-300 text-sm overflow-x-auto max-h-64 overflow-y-auto font-mono">
            {exported}
          </pre>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-800">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Batch
        </button>
      </div>
    </div>
  )
}
