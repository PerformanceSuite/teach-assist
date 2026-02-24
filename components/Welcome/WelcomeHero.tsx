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
    <div className="mb-10 mt-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl shadow-inner border border-indigo-500/10">
          <GraduationCap className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {greeting}{userName ? `, ${userName}` : ''}
        </h1>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
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
