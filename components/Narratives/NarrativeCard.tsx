'use client'

import { useState } from 'react'
import type { StudentNarrative } from '@/lib/api'
import { Check, X, Edit2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

interface NarrativeCardProps {
  narrative: StudentNarrative
  onApprove: (initials: string, draft: string) => Promise<void>
  onFlag: (initials: string, draft: string) => Promise<void>
}

const STATUS_CONFIG = {
  ready_for_review: {
    label: 'Ready',
    color: 'text-yellow-400 bg-yellow-400/10',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'text-green-400 bg-green-400/10',
    icon: CheckCircle2,
  },
  needs_attention: {
    label: 'Needs Attention',
    color: 'text-red-400 bg-red-400/10',
    icon: AlertTriangle,
  },
  error: {
    label: 'Error',
    color: 'text-red-400 bg-red-400/10',
    icon: AlertTriangle,
  },
}

const CRITERIA_NAMES: Record<string, string> = {
  A_knowing: 'A: Knowing',
  B_inquiring: 'B: Inquiring',
  C_processing: 'C: Processing',
  D_reflecting: 'D: Reflecting',
}

export function NarrativeCard({ narrative, onApprove, onFlag }: NarrativeCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDraft, setEditedDraft] = useState(narrative.draft)
  const [isSaving, setIsSaving] = useState(false)

  const statusConfig = STATUS_CONFIG[narrative.status] || STATUS_CONFIG.ready_for_review
  const StatusIcon = statusConfig.icon

  const handleSave = async () => {
    setIsSaving(true)
    await onApprove(narrative.initials, editedDraft)
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleCancel = () => {
    setEditedDraft(narrative.draft)
    setIsEditing(false)
  }

  const handleApprove = async () => {
    setIsSaving(true)
    await onApprove(narrative.initials, narrative.draft)
    setIsSaving(false)
  }

  const handleFlag = async () => {
    setIsSaving(true)
    await onFlag(narrative.initials, narrative.draft)
    setIsSaving(false)
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-lg bg-gray-700 px-3 py-1 rounded">
            {narrative.initials}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{narrative.word_count} words</span>
          <span className="text-gray-600">|</span>
          <span>
            Best: {CRITERIA_NAMES[narrative.criteria_summary.strongest] || narrative.criteria_summary.strongest}
          </span>
          <span className="text-gray-600">|</span>
          <span>
            Growth: {CRITERIA_NAMES[narrative.criteria_summary.growth_area] || narrative.criteria_summary.growth_area}
          </span>
        </div>
      </div>

      {/* Narrative Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedDraft}
            onChange={(e) => setEditedDraft(e.target.value)}
            rows={6}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Save & Approve
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Structured narrative view */}
          {narrative.structure.achievement ? (
            <div className="space-y-2">
              <StructuredSentence label="Achievement" text={narrative.structure.achievement} color="text-blue-400" />
              <StructuredSentence label="Evidence" text={narrative.structure.evidence} color="text-emerald-400" />
              <StructuredSentence label="Growth" text={narrative.structure.growth} color="text-amber-400" />
              <StructuredSentence label="Outlook" text={narrative.structure.outlook} color="text-purple-400" />
            </div>
          ) : (
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {narrative.draft}
            </p>
          )}

          {/* Council Review Notes */}
          {Object.keys(narrative.council_review).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-2">Council Review</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(narrative.council_review).map(([persona, review]) => (
                  <div
                    key={persona}
                    className={`px-2 py-1 rounded text-xs ${
                      review.approved
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {persona}: {review.notes || (review.approved ? 'Approved' : 'Flagged')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              aria-label={`Edit narrative for ${narrative.initials}`}
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            {narrative.status !== 'approved' && (
              <>
                <button
                  onClick={handleFlag}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flag
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StructuredSentence({ label, text, color }: { label: string; text: string; color: string }) {
  if (!text) return null
  return (
    <div className="flex gap-3 items-start">
      <span className={`text-[10px] uppercase tracking-wider font-semibold ${color} w-20 flex-shrink-0 pt-0.5`}>
        {label}
      </span>
      <p className="text-gray-200 text-sm leading-relaxed">{text}</p>
    </div>
  )
}
