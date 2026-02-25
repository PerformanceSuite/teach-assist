'use client'

import { useState, useEffect } from 'react'
import { useGradeStore } from '@/stores/gradeStore'
import type { StudentWork } from '@/lib/api'
import {
    BookOpen,
    FileText,
    Sparkles,
    Loader2,
    AlertCircle,
    Trash2,
    Plus
} from 'lucide-react'

export function PreparationStep() {
    const {
        assignmentName,
        assignmentContext,
        selectedRubricTemplateId,
        rubricTemplates,
        setAssignmentInfo,
        setRubricTemplateId,
        loadRubricTemplates,
        submissions,
        isProcessing,
        progress,
        processingError,
        addSubmission,
        removeSubmission,
        clearSubmissions,
        generateFeedback,
    } = useGradeStore()

    const [localName, setLocalName] = useState(assignmentName)
    const [localContext, setLocalContext] = useState(assignmentContext)
    const [bulkContent, setBulkContent] = useState('')
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

    // Update store when local fields change to avoid needing a "Save" button
    useEffect(() => {
        setAssignmentInfo(localName, localContext)
    }, [localName, localContext, setAssignmentInfo])

    useEffect(() => {
        if (rubricTemplates.length === 0) {
            setIsLoadingTemplates(true)
            loadRubricTemplates().finally(() => setIsLoadingTemplates(false))
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleParseBulk = () => {
        const text = bulkContent.trim()
        if (!text) return

        // Parse blocks that start with [INIT], e.g. [JD] or [XYZ]
        // The regex captures the initials and ignores the surrounding brackets and newlines
        const parts = text.split(/(?:^|\n)\[([A-Za-z]{2,5})\](?:\n|$)/)

        // elements: parts[0] is leading text, parts[1] is ID, parts[2] is content, etc.
        const works: StudentWork[] = []

        for (let i = 1; i < parts.length; i += 2) {
            const studentId = parts[i].toUpperCase()
            const content = parts[i + 1]?.trim()
            if (studentId && content) {
                works.push({ student_id: studentId, content, submission_type: 'text' })
            }
        }

        if (works.length > 0) {
            works.forEach(w => addSubmission(w))
            setBulkContent('')
        } else {
            // Fallback for custom formatted or single pastes: we won't automatically parse it if it doesn't match the tag schema
            alert("Could not find student tags. Please format as [INIT] followed by their work.")
        }
    }

    const progressPercent = progress ? Math.round((progress.completed / progress.total) * 100) : 0
    const canGenerate = localName.trim().length > 0 && submissions.length > 0 && !isProcessing

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Setup */}
                <div className="lg:col-span-5 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Assignment Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="assignmentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Assignment Name *
                                </label>
                                <input
                                    id="assignmentName"
                                    type="text"
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    placeholder="e.g., Forces Lab Report"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="assignmentContext" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Assignment Context <span className="text-gray-400 dark:text-gray-500">(optional)</span>
                                </label>
                                <textarea
                                    id="assignmentContext"
                                    value={localContext}
                                    onChange={(e) => setLocalContext(e.target.value)}
                                    placeholder="Describe what students were asked to do..."
                                    rows={3}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rubric selector */}
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <BookOpen className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-medium">Rubric Template</h3>
                            </div>
                        </div>

                        {isLoadingTemplates ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading templates...</span>
                            </div>
                        ) : (
                            <div className="relative mt-2">
                                <select
                                    value={selectedRubricTemplateId || ''}
                                    onChange={(e) => setRubricTemplateId(e.target.value || null)}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                                >
                                    <option value="">No rubric (general feedback)</option>
                                    {rubricTemplates.map((template) => (
                                        <option key={template.template_id} value={template.template_id}>
                                            {template.name} — {template.subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Submissions */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Student Work</h2>
                        <span className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full">
                            {submissions.length} added
                        </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bulk Paste
                        </label>
                        <textarea
                            value={bulkContent}
                            onChange={(e) => setBulkContent(e.target.value)}
                            placeholder="[JD]&#10;The force of gravity...&#10;&#10;[TS]&#10;An object in motion..."
                            rows={6}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Format: <code className="text-emerald-600 dark:text-emerald-400 bg-gray-100 dark:bg-gray-900 px-1 rounded">[INIT]</code> followed by work
                            </p>
                            <button
                                onClick={handleParseBulk}
                                disabled={!bulkContent.trim()}
                                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
                            >
                                <Plus className="w-4 h-4" />
                                Parse & Add
                            </button>
                        </div>
                    </div>

                    {/* Parsed List */}
                    {submissions.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ready to grade</span>
                                <button
                                    onClick={clearSubmissions}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {submissions.map((work) => (
                                    <div
                                        key={work.student_id}
                                        className="bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 p-3 flex items-start justify-between gap-3 group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-900 dark:text-white font-bold text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded mr-2">
                                                {work.student_id}
                                            </span>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                                                {work.content}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeSubmission(work.student_id)}
                                            className="p-1.5 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all flex-shrink-0"
                                            aria-label={`Remove submission from ${work.student_id}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {processingError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-red-400 font-medium">Processing failed</div>
                                <div className="text-red-300 text-sm mt-1">{processingError}</div>
                            </div>
                        </div>
                    )}

                    {/* Processing Progress */}
                    {isProcessing && (
                        <div className="bg-gray-100 dark:bg-gray-800/80 rounded-lg p-6 border border-gray-300 dark:border-gray-700 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {progress
                                            ? `Generating feedback... ${progress.completed}/${progress.total}`
                                            : 'Starting...'}
                                    </span>
                                </div>
                                {progress && (
                                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-300 relative"
                                            style={{ width: `${progressPercent}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={generateFeedback}
                    disabled={!canGenerate}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-300 dark:disabled:border-gray-700 disabled:border text-white px-8 py-3 rounded-lg font-medium transition-all"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate Feedback
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
