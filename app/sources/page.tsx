/**
 * Sources Page - Upload and manage knowledge base documents
 */

'use client'

import { useState } from 'react'
import { BookOpen, Lightbulb, Upload, Globe, Sparkles } from 'lucide-react'
import { SourceUploader } from '@/components/Sources/SourceUploader'
import { UrlUploader } from '@/components/Sources/UrlUploader'
import { SourceList } from '@/components/Sources/SourceList'
import { SourceStats } from '@/components/Sources/SourceStats'
import { TransformPanel } from '@/components/Sources/TransformPanel'

interface SelectedSource {
  id: string
  title: string
  filename: string
}

type UploadTab = 'file' | 'url'

export default function SourcesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<UploadTab>('file')
  const [selectedSource, setSelectedSource] = useState<SelectedSource | null>(null)
  const [showGlobalTransform, setShowGlobalTransform] = useState(false)

  const handleUploadComplete = (result: any) => {
    setUploadSuccess(`Added "${result.filename}" - ${result.chunk_count || result.chunks} chunks created`)
    setRefreshTrigger(prev => prev + 1)

    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleTransformSelect = (source: { id: string; title: string; filename: string }) => {
    setSelectedSource(source)
    setShowGlobalTransform(false)
  }

  const handleCloseTransform = () => {
    setSelectedSource(null)
    setShowGlobalTransform(false)
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Knowledge Base</h1>
            </div>
            <button
              onClick={() => {
                setShowGlobalTransform(true)
                setSelectedSource(null)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Transform All Sources
            </button>
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
            <div className="flex-shrink-0">&#10003;</div>
            <div>{uploadSuccess}</div>
          </div>
        )}

        {/* Upload section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Add Sources</h2>

          {/* Tab buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              Add URL
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'file' ? (
            <SourceUploader onUploadComplete={handleUploadComplete} />
          ) : (
            <UrlUploader onUploadComplete={handleUploadComplete} />
          )}
        </div>

        {/* Sources list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Your Sources</h2>
            <p className="text-sm text-gray-500">
              Click <Sparkles className="w-3.5 h-3.5 inline text-purple-400" /> to transform a source
            </p>
          </div>
          <SourceList
            refreshTrigger={refreshTrigger}
            onTransformSelect={handleTransformSelect}
          />
        </div>

        {/* Help text */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-400 mb-1">Tip</div>
              <p className="text-sm text-gray-400">
                Upload comprehensive sources for better AI responses. The more context provided,
                the more accurate and relevant the answers will be. Try uploading curriculum standards,
                lesson plans, or unit guides.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transform Panel Modal/Drawer */}
      {(selectedSource || showGlobalTransform) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseTransform}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <TransformPanel
              sourceId={selectedSource?.id}
              sourceName={selectedSource?.title || selectedSource?.filename}
              onClose={handleCloseTransform}
            />
          </div>
        </div>
      )}
    </div>
  )
}
