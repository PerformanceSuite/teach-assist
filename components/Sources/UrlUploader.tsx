/**
 * UrlUploader - Component for ingesting web URLs into the knowledge base
 */

'use client'

import { useState, useCallback } from 'react'
import { Link2, Globe, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

interface UrlUploaderProps {
  onUploadComplete?: (result: any) => void
}

// Basic URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i

export function UrlUploader({ onUploadComplete }: UrlUploaderProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTitleInput, setShowTitleInput] = useState(false)

  const isValidUrl = useCallback((urlString: string): boolean => {
    if (!urlString.trim()) return false
    return URL_REGEX.test(urlString.trim())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await api.sources.uploadUrl(url.trim(), title.trim() || undefined)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.data) {
      // Success
      setUrl('')
      setTitle('')
      setShowTitleInput(false)
      setIsSubmitting(false)
      if (onUploadComplete) {
        onUploadComplete({
          ...result.data,
          filename: result.data.filename,
          chunk_count: result.data.chunks,
        })
      }
    }
  }

  const handleClear = () => {
    setUrl('')
    setTitle('')
    setError(null)
    setShowTitleInput(false)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !showTitleInput) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-800/50 hover:bg-gray-800 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400 mb-3">
                Add a webpage to your knowledge base
              </p>

              {/* URL Input */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link2 className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com/article"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                />
                {url && !isSubmitting && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Optional Title Toggle */}
              {!showTitleInput && url && !isSubmitting && (
                <button
                  type="button"
                  onClick={() => setShowTitleInput(true)}
                  className="text-sm text-gray-500 hover:text-gray-400 transition-colors mb-3"
                >
                  + Add custom title (optional)
                </button>
              )}

              {/* Title Input (optional) */}
              {showTitleInput && (
                <div className="mb-3">
                  <label htmlFor="url-title" className="block text-sm text-gray-400 mb-1">
                    Custom Title (optional)
                  </label>
                  <input
                    id="url-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., NGSS Standards Overview"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !url.trim()}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching page...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Add URL</span>
                  </>
                )}
              </button>

              {/* Help text */}
              <p className="mt-3 text-xs text-gray-500">
                Works with articles, documentation, and public web pages.
                Content is extracted and indexed for AI-powered search.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400 font-medium">Failed to add URL</p>
            <p className="text-sm text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default UrlUploader
