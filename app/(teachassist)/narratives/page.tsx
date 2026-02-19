'use client'

import { NarrativesWizard } from '@/components/Narratives'

export default function NarrativesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Narrative Comments</h1>
          <p className="text-gray-400">
            Generate personalized semester narratives for your students based on IB MYP criteria.
          </p>
        </div>

        {/* Wizard */}
        <NarrativesWizard />
      </div>
    </div>
  )
}
