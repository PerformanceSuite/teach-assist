'use client'

import { useState } from 'react'
import { useGradeStore } from '@/stores/gradeStore'
import type { FeedbackDraft } from '@/lib/api'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
} from 'lucide-react'

export function ReviewStep() {
  const {
    feedback,
    assignmentName,
    editFeedback,
    prevStep,
    nextStep,
  } = useGradeStore()

  const [filter, setFilter] = useState<'all' | 'ready' | 'approved'>('all')

  const counts = {
    all: feedback.length,
    ready: feedback.filter(f => f.status === 'ready_for_review').length,
    approved: feedback.filter(f => f.status === 'approved' || f.status === 'edited').length,
  }

  const filtered = feedback.filter(f => {
    if (filter === 'all') return true
    if (filter === 'ready') return f.status === 'ready_for_review'
    if (filter === 'approved') return f.status === 'approved' || f.status === 'edited'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Review Feedback</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Review and approve AI-generated feedback for &ldquo;{assignmentName}&rdquo;
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {counts.approved}/{counts.all} approved
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {[
          { key: 'all' as const, label: 'All', count: counts.all },
          { key: 'ready' as const, label: 'Ready', count: counts.ready, icon: <Clock className="w-3.5 h-3.5" /> },
          { key: 'approved' as const, label: 'Approved', count: counts.approved, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
              filter === tab.key ? 'bg-emerald-500/30' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {filtered.map(fb => (
          <FeedbackCard
            key={fb.student_id}
            feedback={fb}
            onApprove={(id, draft) => editFeedback(id, draft, 'approved')}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No feedback matches this filter.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={nextStep}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Next: Export
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function FeedbackCard({
  feedback,
  onApprove,
}: {
  feedback: FeedbackDraft
  onApprove: (studentId: string, draft: string) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDraft, setEditedDraft] = useState(feedback.draft_comment)
  const [isSaving, setIsSaving] = useState(false)

  const isApproved = feedback.status === 'approved' || feedback.status === 'edited'

  const handleSave = async () => {
    setIsSaving(true)
    await onApprove(feedback.student_id, editedDraft)
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleApprove = async () => {
    setIsSaving(true)
    await onApprove(feedback.student_id, feedback.draft_comment)
    setIsSaving(false)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-900 dark:text-white font-bold text-lg bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
            {feedback.student_id}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              isApproved
                ? 'text-green-400 bg-green-400/10'
                : 'text-yellow-400 bg-yellow-400/10'
            }`}
          >
            {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {isApproved ? 'Approved' : 'Ready'}
          </span>
        </div>
        <span className="text-xs text-gray-500">{feedback.word_count} words</span>
      </div>

      {/* Structured Feedback */}
      {!isEditing && (
        <div className="space-y-3">
          {feedback.strengths.length > 0 && (
            <div className="flex gap-3 items-start">
              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-400 text-xs uppercase font-semibold">Strengths</span>
                <ul className="text-gray-700 dark:text-gray-200 text-sm mt-1 space-y-0.5">
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          )}

          {feedback.growth_areas.length > 0 && (
            <div className="flex gap-3 items-start">
              <TrendingDown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-amber-400 text-xs uppercase font-semibold">Growth Areas</span>
                <ul className="text-gray-700 dark:text-gray-200 text-sm mt-1 space-y-0.5">
                  {feedback.growth_areas.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </div>
          )}

          {feedback.evidence.length > 0 && (
            <div className="flex gap-3 items-start">
              <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-blue-400 text-xs uppercase font-semibold">Evidence</span>
                <ul className="text-gray-700 dark:text-gray-200 text-sm mt-1 space-y-0.5">
                  {feedback.evidence.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          )}

          {feedback.next_steps.length > 0 && (
            <div className="flex gap-3 items-start">
              <Lightbulb className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-purple-400 text-xs uppercase font-semibold">Next Steps</span>
                <ul className="text-gray-700 dark:text-gray-200 text-sm mt-1 space-y-0.5">
                  {feedback.next_steps.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Full Draft */}
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
            <div className="text-gray-500 text-xs uppercase mb-1">Full Comment</div>
            <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{feedback.draft_comment}</p>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-3">
          <textarea
            value={editedDraft}
            onChange={(e) => setEditedDraft(e.target.value)}
            rows={6}
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setEditedDraft(feedback.draft_comment); setIsEditing(false) }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Save & Approve
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            aria-label={`Edit feedback for ${feedback.student_id}`}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          {!isApproved && (
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
          )}
        </div>
      )}
    </div>
  )
}
