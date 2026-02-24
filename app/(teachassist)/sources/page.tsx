/**
 * Sources Page - Upload and manage knowledge base documents
 */

'use client'

import { useState } from 'react'
import { BookOpen, Lightbulb, Upload, Globe, Sparkles, X, FileText } from 'lucide-react'
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleUploadComplete = (result: any) => {
    setUploadSuccess(`Added "${result.filename}" - ${result.chunk_count || result.chunks} chunks created`)
    setRefreshTrigger(prev => prev + 1)
    setIsUploadModalOpen(false)

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
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-xl border border-indigo-500/20">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Curriculum Sources</h1>
                <p className="text-sm text-gray-400 mt-1">Manage documents and standards powering your AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowGlobalTransform(true)
                  setSelectedSource(null)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Transform
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Source
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <SourceStats />

        {/* Success message */}
        {uploadSuccess && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/50 p-4 text-sm text-emerald-400 flex items-center gap-2 shadow-sm">
            <div className="flex-shrink-0 bg-emerald-500/20 rounded-full p-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>{uploadSuccess}</div>
          </div>
        )}

        {/* Sources list (Primary Workspace) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Source Manifest
            </h2>
          </div>
          <SourceList
            refreshTrigger={refreshTrigger}
            onTransformSelect={handleTransformSelect}
          />
        </div>

        {/* Actionable Tip */}
        <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-4 flex items-start gap-3 mt-8">
          <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-gray-200 mb-1">Workflow Tip</div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before heading to the Plan Studio, ensure your state standards and pacing guides are uploaded here. The AI will automatically cross-reference these documents when generating your unit plans.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsUploadModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Add New Source
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Tab buttons */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-800/50 rounded-lg border border-gray-800 w-fit">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'file'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  <Upload className="w-4 h-4" />
                  Document
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'url'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  Web URL
                </button>
              </div>

              {/* Tab content */}
              <div className="bg-gray-950/50 rounded-xl p-6 border border-gray-800">
                {activeTab === 'file' ? (
                  <SourceUploader onUploadComplete={handleUploadComplete} />
                ) : (
                  <UrlUploader onUploadComplete={handleUploadComplete} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transform Panel Modal/Drawer */}
      {(selectedSource || showGlobalTransform) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
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
