/**
 * Welcome Page - Default landing page with teacher dashboard
 * Adapted from CC4 WelcomePage
 */

'use client'

import { WelcomeHero } from '../components/Welcome/WelcomeHero'
import { QuickStartSection } from '../components/Welcome/QuickStartSection'
import { RecentActivitySection } from '../components/Welcome/RecentActivitySection'
import { FeatureOverview } from '../components/Welcome/FeatureOverview'
import { ComplianceNote } from '../components/Welcome/ComplianceNote'
import { useRecentActivity } from '../hooks/useRecentActivity'
import { useState } from 'react'

export default function WelcomePage() {
  const { activities, loading } = useRecentActivity(8)
  const [helpOpen, setHelpOpen] = useState(false)

  // Check if this is a new user (no activity)
  const isNewUser = activities.length === 0

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <WelcomeHero />

        {/* Quick Start Actions */}
        <QuickStartSection onOpenHelp={() => setHelpOpen(true)} />

        {/* Recent Activity */}
        <RecentActivitySection activities={activities} loading={loading} />

        {/* Feature Overview (for new users) */}
        {isNewUser && <FeatureOverview />}

        {/* Compliance Note */}
        <ComplianceNote />
      </div>
    </div>
  )
}
