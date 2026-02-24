'use client'

import { useGradeStore } from '@/stores/gradeStore'
import { Check, ClipboardList, Sparkles, Download } from 'lucide-react'
import { PreparationStep } from './PreparationStep'
import { ReviewStep } from './ReviewStep'
import { ExportStep } from './ExportStep'

const steps = [
  { id: 1, name: 'Preparation', icon: ClipboardList },
  { id: 2, name: 'Review', icon: Sparkles },
  { id: 3, name: 'Export', icon: Download },
]

export function GradeWizard() {
  const { currentStep, setStep, assignmentName, submissions, feedback } = useGradeStore()

  const canAccessStep = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return true
      case 2: return feedback.length > 0
      case 3: return feedback.length > 0
      default: return false
    }
  }

  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return submissions.length > 0 && !!assignmentName
      case 2: return feedback.some(f => f.status === 'approved')
      case 3: return false
      default: return false
    }
  }

  const handleStepClick = (stepId: number) => {
    if (canAccessStep(stepId)) setStep(stepId)
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
                  className={`relative flex flex-col items-center group ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${isActive
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10'
                        : isComplete || isPast
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isAccessible
                            ? 'border-gray-600 bg-gray-800 text-gray-400 group-hover:border-gray-500'
                            : 'border-gray-700 bg-gray-900 text-gray-600'
                      }`}
                  >
                    {(isComplete || isPast) && !isActive ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs font-medium whitespace-nowrap ${isActive
                        ? 'text-emerald-400'
                        : isAccessible
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                  >
                    {step.name}
                  </span>
                </button>

                {stepIdx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-1.25rem] ${isPast || isComplete ? 'bg-emerald-500' : 'bg-gray-700'
                      }`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        {currentStep === 1 && <PreparationStep />}
        {currentStep === 2 && <ReviewStep />}
        {currentStep === 3 && <ExportStep />}
      </div>
    </div>
  )
}
