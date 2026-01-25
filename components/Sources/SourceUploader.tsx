/**
 * SourceUploader - Drag and drop file upload component
 */

'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface SourceUploaderProps {
  onUploadComplete?: (result: any) => void
}

export function SourceUploader({ onUploadComplete }: SourceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (isValidFileType(file)) {
        setSelectedFile(file)
        setTitle(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
        setError(null)
      } else {
        setError('Please upload a PDF, DOCX, or TXT file')
      }
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (isValidFileType(file)) {
        setSelectedFile(file)
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
        setError(null)
      } else {
        setError('Please upload a PDF, DOCX, or TXT file')
      }
    }
  }, [])

  const isValidFileType = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    return validTypes.includes(file.type) || file.name.match(/\.(pdf|docx|txt)$/i)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    const result = await api.sources.upload(selectedFile, title || undefined)

    if (result.error) {
      setError(result.error)
      setUploading(false)
    } else if (result.data) {
      // Success
      setSelectedFile(null)
      setTitle('')
      setUploading(false)
      if (onUploadComplete) {
        onUploadComplete(result.data)
      }
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setTitle('')
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            
            <div>
              <p className="text-white font-medium mb-1">
                Drop your file here, or{' '}
                <label htmlFor="file-upload" className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  browse
                </label>
              </p>
              <p className="text-sm text-gray-400">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400 mb-1">Selected file:</p>
                  <p className="text-white font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="title" className="block text-sm text-gray-400 mb-1">
                    Document Title (optional)
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 5th Grade Science Standards"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    disabled={uploading}
                  />
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}

export default SourceUploader
