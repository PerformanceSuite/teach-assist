/**
 * WelcomeHero - Hero section for the welcome dashboard
 * Adapted for TeachAssist from CC4
 */

import { GraduationCap } from 'lucide-react'

interface WelcomeHeroProps {
  userName?: string
}

export function WelcomeHero({ userName }: WelcomeHeroProps) {
  const greeting = getGreeting()

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white">
          {greeting}{userName ? `, ${userName}` : ''}
        </h1>
      </div>
      <p className="text-gray-400 text-lg max-w-2xl">
        TeachAssist is your intelligent teaching companion. Upload curriculum sources, ask
        grounded questions with your Knowledge Base, and consult your Inner Council of AI
        advisors for expert feedback.
      </p>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default WelcomeHero
