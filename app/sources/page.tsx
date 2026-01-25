/**
 * Sources Page - Upload and manage knowledge base documents
 */

'use client'

import { useState } from 'react'
import { BookOpen, Lightbulb } from 'lucide-react'
import { SourceUploader } from '@/components/Sources/SourceUploader'
import { SourceList } from '@/components/Sources/SourceList'
import { SourceStats } from '@/components/Sources/SourceStats'

export default function SourcesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const handleUploadComplete = (result: any) => {
    setUploadSuccess(`Uploaded ${result.filename} - ${result.chunk_count} chunks created`)
    setRefreshTrigger(prev => prev + 1)

    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Knowledge Base</h1>
          </div>
          <p className="text-gray-400 max-w-3xl">
            Upload curriculum documents, standards, lesson plans, and other teaching resources.
            The AI will use these sources to provide grounded, citation-backed answers to your questions.
          </p>
        </div>

        {/* Stats */}
        <SourceStats />

        {/* Success message */}
        {uploadSuccess && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/50 p-4 text-sm text-emerald-400 flex items-center gap-2">
            <div className="flex-shrink-0">✓</div>
            <div>{uploadSuccess}</div>
          </div>
        )}

        {/* Upload section */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-white">Upload Documents</h2>
          <SourceUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* Sources list */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-white">Your Sources</h2>
          <SourceList refreshTrigger={refreshTrigger} />
        </div>

        {/* Help text */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-400 mb-1">💡 Tip</div>
              <p className="text-sm text-gray-400">
                Upload comprehensive sources for better AI responses. The more context provided,
                the more accurate and relevant the answers will be. Try uploading curriculum standards,
                lesson plans, or unit guides.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
