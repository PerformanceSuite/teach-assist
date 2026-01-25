/**
 * Sources Page - Upload and manage knowledge base documents
 */

'use client'

import { useState } from 'react'
import SourceUploader from '@/components/notebook/SourceUploader'
import SourceList from '@/components/notebook/SourceList'
import { UploadResponse } from '@/lib/api'

export default function SourcesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const handleUploadComplete = (result: UploadResponse) => {
    setUploadSuccess(`Uploaded ${result.filename} - ${result.chunks} chunks created`)
    setRefreshTrigger(prev => prev + 1)

    // Clear success message after 3 seconds
    setTimeout(() => setUploadSuccess(null), 3000)
  }

  return (
    <div className="h-full overflow-auto p-6 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Knowledge Base</h1>
          <p className="text-sm text-neutral-600">
            Upload curriculum documents, standards, lesson plans, and other teaching resources.
            The AI will use these sources to provide grounded answers to your questions.
          </p>
        </div>

        {/* Success message */}
        {uploadSuccess && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            ✓ {uploadSuccess}
          </div>
        )}

        {/* Upload section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Upload Documents</h2>
          <SourceUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* Sources list */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Your Sources</h2>
          <SourceList refreshTrigger={refreshTrigger} />
        </div>

        {/* Help text */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <div className="font-medium mb-1">💡 Tip</div>
          <p>
            Upload comprehensive sources for better AI responses. The more context provided,
            the more accurate and relevant the answers will be.
          </p>
        </div>
      </div>
    </div>
  )
}
