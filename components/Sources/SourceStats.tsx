/**
 * SourceStats - Display knowledge base statistics
 */

'use client'

import { useState, useEffect } from 'react'
import { FileText, Database, Sparkles } from 'lucide-react'
import api from '@/lib/api'

export function SourceStats() {
  const [stats, setStats] = useState<{
    total_documents: number
    total_chunks: number
    embedding_model: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const result = await api.sources.stats()
    if (result.data) {
      setStats(result.data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="h-4 w-24 bg-gray-900 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-900 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm text-gray-400">Total Documents</span>
        </div>
        <p className="text-2xl font-semibold text-white">{stats.total_documents}</p>
      </div>

      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm text-gray-400">Total Chunks</span>
        </div>
        <p className="text-2xl font-semibold text-white">{stats.total_chunks}</p>
      </div>

      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-sm text-gray-400">AI Model</span>
        </div>
        <p className="text-sm font-medium text-white truncate" title={stats.embedding_model}>
          {stats.embedding_model.split('/').pop()}
        </p>
      </div>
    </div>
  )
}

export default SourceStats
