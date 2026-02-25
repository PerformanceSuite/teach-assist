'use client'

import { useNarrativesStore } from '@/stores/narrativesStore'
import { Check, BookOpen, Users, Sparkles, FileEdit, Download } from 'lucide-react'
import { ClassSetupStep } from './ClassSetupStep'
import { StudentDataStep } from './StudentDataStep'
import { GenerateStep } from './GenerateStep'
import { ReviewStep } from './ReviewStep'
import { ExportStep } from './ExportStep'

const steps = [
  { id: 1, name: 'Class Setup', icon: BookOpen },
  { id: 2, name: 'Students', icon: Users },
  { id: 3, name: 'Generate', icon: Sparkles },
  { id: 4, name: 'Review', icon: FileEdit },
  { id: 5, name: 'Export', icon: Download },
]

export function NarrativesWizard() {
  const { currentStep, setStep, className, semester, students, narratives } = useNarrativesStore()

  // Determine which steps are accessible
  const canAccessStep = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return true
      case 2:
        return !!(className && semester)
      case 3:
        return !!(className && semester && students.length > 0)
      case 4:
        return narratives.length > 0
      case 5:
        return narratives.length > 0
      default:
        return false
    }
  }

  // Determine if step is complete
  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return !!(className && semester)
      case 2:
        return students.length > 0
      case 3:
        return narratives.length > 0
      case 4:
        return narratives.some((n) => n.status === 'approved')
      case 5:
        return false // Export is never "complete" in the traditional sense
      default:
        return false
    }
  }

  const handleStepClick = (stepId: number) => {
    if (canAccessStep(stepId)) {
      setStep(stepId)
    }
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => {
            const isActive = currentStep === step.id
            const isComplete = isStepComplete(step.id)
            const isAccessible = canAccessStep(step.id)
            const isPast = currentStep > step.id
            const Icon = step.icon

            return (
              <li key={step.name} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`relative flex flex-col items-center group ${
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400 ring-4 ring-blue-500/10'
                        : isComplete || isPast
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : isAccessible
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {(isComplete || isPast) && !isActive ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs font-medium whitespace-nowrap ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : isAccessible
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {step.name}
                  </span>
                </button>

                {/* Connecting line */}
                {stepIdx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-1.25rem] ${
                      isPast || isComplete ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {currentStep === 1 && <ClassSetupStep />}
        {currentStep === 2 && <StudentDataStep />}
        {currentStep === 3 && <GenerateStep />}
        {currentStep === 4 && <ReviewStep />}
        {currentStep === 5 && <ExportStep />}
      </div>
    </div>
  )
}
