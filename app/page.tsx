/**
 * Welcome Page - Default landing page with teacher dashboard
 */

'use client'

import { WelcomeHero } from '../components/Welcome/WelcomeHero'
import { QuickStartSection } from '../components/Welcome/QuickStartSection'
import { RecentActivitySection } from '../components/Welcome/RecentActivitySection'
import { FeatureOverview } from '../components/Welcome/FeatureOverview'
import { useState, useEffect } from 'react'

export default function WelcomePage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch recent activity from backend
    // For now, show empty state
    setLoading(false)
    setActivities([])
  }, [])

  // Check if this is a new user (no activity)
  const isNewUser = activities.length === 0

  return (
    <div className="h-full overflow-auto p-6 bg-gray-950">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <WelcomeHero />

        {/* Quick Start Actions */}
        <QuickStartSection />

        {/* Recent Activity */}
        <RecentActivitySection activities={activities} loading={loading} />

        {/* Feature Overview (for new users) */}
        {isNewUser && <FeatureOverview />}
      </div>
    </div>
  )
}
