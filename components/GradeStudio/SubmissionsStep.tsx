'use client'

import { useState } from 'react'
import { useGradeStore } from '@/stores/gradeStore'
import type { StudentWork } from '@/lib/api'
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export function SubmissionsStep() {
  const {
    submissions,
    assignmentName,
    isProcessing,
    progress,
    processingError,
    addSubmission,
    removeSubmission,
    clearSubmissions,
    generateFeedback,
    prevStep,
  } = useGradeStore()

  const [studentId, setStudentId] = useState('')
  const [content, setContent] = useState('')

  const handleAdd = () => {
    if (!studentId.trim() || !content.trim()) return
    addSubmission({
      student_id: studentId.toUpperCase().trim(),
      content: content.trim(),
      submission_type: 'text',
    })
    setStudentId('')
    setContent('')
  }

  const handlePaste = () => {
    // Parse pasted text as multiple submissions separated by "---" or "[XX]"
    const text = content.trim()
    if (!text) return

    const sections = text.split(/\n---\n|\n\[([A-Z]{2,5})\]\n/)
    let currentId = ''
    const works: StudentWork[] = []

    for (const section of sections) {
      const trimmed = section.trim()
      if (!trimmed) continue

      // Check if this is a student ID marker
      if (/^[A-Z]{2,5}$/.test(trimmed)) {
        currentId = trimmed
      } else if (currentId) {
        works.push({ student_id: currentId, content: trimmed, submission_type: 'text' })
        currentId = ''
      }
    }

    if (works.length > 0) {
      works.forEach(w => addSubmission(w))
      setContent('')
      setStudentId('')
    }
  }

  const progressPercent = progress ? Math.round((progress.completed / progress.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Student Submissions</h2>
          <p className="text-gray-400 text-sm">
            Add student work for &ldquo;{assignmentName}&rdquo;
          </p>
        </div>
        <span className="text-gray-400 text-sm">{submissions.length} submissions</span>
      </div>

      {/* Add Form */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Student Work
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Student Initials</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.slice(0, 5))}
              placeholder="AB"
              className="w-full md:w-40 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Student Work (paste or type)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the student's work here..."
              rows={5}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!studentId.trim() || !content.trim()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Submission
            </button>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Submissions ({submissions.length})
            </h3>
            <button
              onClick={clearSubmissions}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {submissions.map((work) => (
              <div
                key={work.student_id}
                className="bg-gray-800/30 rounded-lg border border-gray-700 p-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-white font-bold text-sm bg-gray-700 px-2 py-0.5 rounded mr-2">
                    {work.student_id}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {work.content.length} chars
                  </span>
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                    {work.content}
                  </p>
                </div>
                <button
                  onClick={() => removeSubmission(work.student_id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label={`Remove submission from ${work.student_id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No submissions yet</p>
          <p className="text-sm mt-1">Add student work using the form above</p>
        </div>
      )}

      {/* Error Display */}
      {processingError && (
        <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 font-medium">Processing failed</div>
            <div className="text-red-300 text-sm mt-1">{processingError}</div>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="text-white font-medium">
                {progress
                  ? `Generating feedback... ${progress.completed}/${progress.total}`
                  : 'Starting...'}
              </span>
            </div>
            {progress && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Skeletons */}
          <div className="space-y-3">
            {Array.from({ length: Math.min(submissions.length, 2) }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-6 bg-gray-700 rounded" />
                  <div className="w-20 h-4 bg-gray-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-700 rounded w-4/5" />
                  <div className="h-3 bg-gray-700 rounded w-3/5" />
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
          disabled={isProcessing}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={generateFeedback}
          disabled={isProcessing || submissions.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Feedback
            </>
          )}
        </button>
      </div>
    </div>
  )
}
