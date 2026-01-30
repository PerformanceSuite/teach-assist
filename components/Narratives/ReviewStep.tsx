'use client'

import { useState } from 'react'
import { useNarrativesStore } from '@/stores/narrativesStore'
import { NarrativeCard } from './NarrativeCard'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lightbulb,
  Users,
} from 'lucide-react'

export function ReviewStep() {
  const {
    narratives,
    patterns,
    clusters,
    className,
    semester,
    updateNarrative,
    prevStep,
    nextStep,
  } = useNarrativesStore()

  const [filter, setFilter] = useState<'all' | 'ready' | 'approved' | 'attention'>('all')

  // Count by status
  const counts = {
    all: narratives.length,
    ready: narratives.filter((n) => n.status === 'ready_for_review').length,
    approved: narratives.filter((n) => n.status === 'approved').length,
    attention: narratives.filter((n) => n.status === 'needs_attention').length,
  }

  // Filter narratives
  const filteredNarratives = narratives.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'ready') return n.status === 'ready_for_review'
    if (filter === 'approved') return n.status === 'approved'
    if (filter === 'attention') return n.status === 'needs_attention'
    return true
  })

  const handleApprove = async (initials: string, draft: string) => {
    await updateNarrative(initials, draft, 'approved')
  }

  const handleFlag = async (initials: string, draft: string) => {
    await updateNarrative(initials, draft, 'needs_revision')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Review Narratives</h2>
          <p className="text-gray-400 text-sm">
            Review, edit, and approve generated narratives for {className}.
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {counts.approved}/{counts.all} approved
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <FilterButton
          label="All"
          count={counts.all}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterButton
          label="Ready"
          count={counts.ready}
          active={filter === 'ready'}
          onClick={() => setFilter('ready')}
          icon={<Clock className="w-3.5 h-3.5" />}
        />
        <FilterButton
          label="Approved"
          count={counts.approved}
          active={filter === 'approved'}
          onClick={() => setFilter('approved')}
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        />
        <FilterButton
          label="Needs Attention"
          count={counts.attention}
          active={filter === 'attention'}
          onClick={() => setFilter('attention')}
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Narrative Cards */}
        <div className="flex-1 space-y-4">
          {filteredNarratives.length > 0 ? (
            filteredNarratives.map((narrative) => (
              <NarrativeCard
                key={narrative.initials}
                narrative={narrative}
                onApprove={handleApprove}
                onFlag={handleFlag}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No narratives match this filter.</p>
            </div>
          )}
        </div>

        {/* Patterns Sidebar */}
        {(patterns.length > 0 || clusters.length > 0) && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 sticky top-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Insights
              </h3>

              {/* Patterns */}
              {patterns.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-gray-400 text-xs uppercase tracking-wider">Patterns</h4>
                  {patterns.map((pattern, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="text-white text-sm font-medium mb-1">
                        {pattern.description}
                      </div>
                      <div className="text-gray-400 text-xs mb-2">
                        {pattern.affected_students.length} students:{' '}
                        {pattern.affected_students.join(', ')}
                      </div>
                      <div className="text-blue-400 text-xs">
                        💡 {pattern.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Clusters */}
              {clusters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Student Groups
                  </h4>
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.cluster_id}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="text-white text-sm font-medium mb-1">
                        {cluster.shared_growth_area.replace('_', ': ')}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {cluster.student_initials.join(', ')}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {cluster.pattern}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
          onClick={nextStep}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Next: Export
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  icon,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
      <span
        className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
          active ? 'bg-blue-500/30' : 'bg-gray-700'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
