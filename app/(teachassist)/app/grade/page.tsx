'use client'

import { GradeWizard } from '@/components/GradeStudio'

export default function GradeStudioPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Grade Studio</h1>
        <p className="text-gray-400 mt-1">
          Generate rubric-aligned feedback drafts for student work. You review and approve every comment.
        </p>
      </div>
      <GradeWizard />
    </div>
  )
}
