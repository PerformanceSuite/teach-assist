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
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const isActive = currentStep === step.id
            const isComplete = isStepComplete(step.id)
            const isAccessible = canAccessStep(step.id)
            const Icon = step.icon

            return (
              <li key={step.name} className="relative flex-1">
                {stepIdx !== 0 && (
                  <div
                    className={`absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 -ml-2 ${
                      isComplete || currentStep > step.id ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                    style={{ width: 'calc(100% - 2rem)', left: '-50%' }}
                  />
                )}

                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`relative flex flex-col items-center group ${
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isComplete
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : isAccessible
                            ? 'border-gray-600 bg-gray-800 text-gray-400 group-hover:border-gray-500'
                            : 'border-gray-700 bg-gray-900 text-gray-600'
                    }`}
                  >
                    {isComplete && !isActive ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive
                        ? 'text-blue-400'
                        : isAccessible
                          ? 'text-gray-400'
                          : 'text-gray-600'
                    }`}
                  >
                    {step.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        {currentStep === 1 && <ClassSetupStep />}
        {currentStep === 2 && <StudentDataStep />}
        {currentStep === 3 && <GenerateStep />}
        {currentStep === 4 && <ReviewStep />}
        {currentStep === 5 && <ExportStep />}
      </div>
    </div>
  )
}
