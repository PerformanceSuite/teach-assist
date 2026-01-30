/**
 * SourceList - Display and manage uploaded documents
 */

'use client'

import { useState, useEffect } from 'react'
import { FileText, Trash2, Clock, FileType, Loader2, Sparkles } from 'lucide-react'
import api from '@/lib/api'

interface Source {
  id: string
  title: string
  filename: string
  filetype: string
  upload_date: string
  size_bytes: number
  chunk_count: number
}

interface SourceListProps {
  refreshTrigger?: number
  onTransformSelect?: (source: Source) => void
}

export function SourceList({ refreshTrigger = 0, onTransformSelect }: SourceListProps) {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSources()
  }, [refreshTrigger])

  const loadSources = async () => {
    setLoading(true)
    setError(null)
    
    const result = await api.sources.list()
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.data) {
      setSources(result.data)
      setLoading(false)
    }
  }

  const handleDelete = async (sourceId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(sourceId)
    const result = await api.sources.delete(sourceId)

    if (result.error) {
      alert(`Failed to delete: ${result.error}`)
      setDeleting(null)
    } else {
      // Remove from list
      setSources(sources.filter(s => s.id !== sourceId))
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Unknown'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-900 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-900 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-400">
        Failed to load sources: {error}
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 text-center">
        <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">No documents uploaded yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Upload your first document above to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <div
          key={source.id}
          className="p-4 bg-gray-800 hover:bg-gray-800/80 rounded-xl border border-gray-700 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{source.title}</h3>
                  <p className="text-sm text-gray-400 truncate mt-0.5">{source.filename}</p>
                </div>

                <div className="flex items-center gap-1">
                  {onTransformSelect && (
                    <button
                      onClick={() => onTransformSelect(source)}
                      className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors group"
                      title="Transform source"
                    >
                      <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(source.id, source.filename)}
                    disabled={deleting === source.id}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete document"
                  >
                    {deleting === source.id ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FileType className="w-3.5 h-3.5" />
                  <span className="uppercase">{source.filetype}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(source.upload_date)}</span>
                </div>
                <div>
                  {formatSize(source.size_bytes)}
                </div>
                <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full">
                  {source.chunk_count} chunks
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SourceList
