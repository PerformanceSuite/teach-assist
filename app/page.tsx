/**
 * WelcomePage - Default landing page with teacher dashboard
 */

'use client'

import { WelcomeHero } from '../components/Welcome/WelcomeHero'
import { QuickStartSection } from '../components/Welcome/QuickStartSection'
import { RecentActivitySection } from '../components/Welcome/RecentActivitySection'
import { FeatureOverview } from '../components/Welcome/FeatureOverview'
import { useRecentActivity } from '../hooks/useRecentActivity'
import { useOnboardingStore } from '../stores/onboardingStore'
import { useCouncilStore } from '../stores/councilStore'

export default function Home() {
  const { activities, loading } = useRecentActivity(8)
  const { hasCompletedOnboarding } = useOnboardingStore()
  const { setFeedOpen } = useCouncilStore()

  // Check if this is a new user (no activity)
  const isNewUser = !hasCompletedOnboarding || activities.length === 0

  return (
    <div
      className="h-full overflow-auto p-6 bg-[#0a0b0d]"
      data-onboarding="welcome-page"
    >
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <WelcomeHero />

        {/* Quick Start Actions */}
        <QuickStartSection
          onOpenCouncil={() => setFeedOpen(true)}
        />

        {/* Recent Activity */}
        <RecentActivitySection activities={activities} loading={loading} />

        {/* Feature Overview (for new users) */}
        {isNewUser && <FeatureOverview />}
      </div>
    </div>
  )
}
