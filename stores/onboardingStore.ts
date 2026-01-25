/**
 * Zustand store for onboarding/first-run experience.
 *
 * Tracks:
 * - Whether user has completed onboarding
 * - Current step in welcome flow
 * - Feature tooltip visibility
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector?: string  // CSS selector for spotlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

// Welcome flow steps
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CommandCenter',
    description: 'Your strategic intelligence system for validating beliefs and making better decisions. Let me show you around.',
    position: 'center',
  },
  {
    id: 'welcome-page',
    title: 'Your Dashboard',
    description: 'This is your home base. Quick actions get you started, and recent activity keeps you in the loop.',
    targetSelector: '[data-onboarding="welcome-page"]',
    position: 'bottom',
  },
  {
    id: 'search-bar',
    title: 'Command Palette',
    description: 'Search and run commands from anywhere. Press Cmd+K to open the command palette.',
    targetSelector: '[data-onboarding="search-bar"]',
    position: 'bottom',
  },
  {
    id: 'brain-icon',
    title: 'Intelligence Feed',
    description: 'When this icon pulses, something needs your attention - a hypothesis was validated, a prediction resolved, or a threshold crossed.',
    targetSelector: '[data-onboarding="brain-icon"]',
    position: 'top',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get proactive suggestions based on your current context. Press Cmd+. anytime to open the AI assistant.',
    position: 'center',
  },
  {
    id: 'help-center',
    title: 'Help Center',
    description: 'Need help? Press Cmd+/ to open the help center with searchable documentation and guides.',
    position: 'center',
  },
]

interface OnboardingState {
  // Persistent state
  hasCompletedOnboarding: boolean

  // Runtime state
  isOnboardingActive: boolean
  currentStepIndex: number

  // Computed
  currentStep: () => OnboardingStep | null
  isLastStep: () => boolean
  progress: () => number

  // Actions
  startOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void  // For re-triggering from settings
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      isOnboardingActive: false,
      currentStepIndex: 0,

      currentStep: () => {
        const index = get().currentStepIndex
        return ONBOARDING_STEPS[index] ?? null
      },

      isLastStep: () => {
        return get().currentStepIndex === ONBOARDING_STEPS.length - 1
      },

      progress: () => {
        return ((get().currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100
      },

      startOnboarding: () => {
        set({ isOnboardingActive: true, currentStepIndex: 0 })
      },

      nextStep: () => {
        const current = get().currentStepIndex
        if (current < ONBOARDING_STEPS.length - 1) {
          set({ currentStepIndex: current + 1 })
        } else {
          get().completeOnboarding()
        }
      },

      previousStep: () => {
        const current = get().currentStepIndex
        if (current > 0) {
          set({ currentStepIndex: current - 1 })
        }
      },

      skipOnboarding: () => {
        set({
          isOnboardingActive: false,
          hasCompletedOnboarding: true,
          currentStepIndex: 0,
        })
      },

      completeOnboarding: () => {
        set({
          isOnboardingActive: false,
          hasCompletedOnboarding: true,
          currentStepIndex: 0,
        })
      },

      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          isOnboardingActive: false,
          currentStepIndex: 0,
        })
      },
    }),
    {
      name: 'cc4-onboarding',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
)

// Selector hooks for components
export const useIsOnboardingActive = () => useOnboardingStore(state => state.isOnboardingActive)
export const useCurrentOnboardingStep = () => useOnboardingStore(state => state.currentStep())
export const useShouldShowOnboarding = () => useOnboardingStore(state =>
  !state.hasCompletedOnboarding && !state.isOnboardingActive
)
