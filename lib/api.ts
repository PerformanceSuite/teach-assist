/**
 * API Client for TeachAssist Backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

interface ApiResponse<T> {
  data?: T
  error?: string
}

// Source Types
interface Source {
  id: string
  title: string
  filename: string
  filetype: string
  upload_date: string
  size_bytes: number
  chunk_count: number
}

interface UploadResponse {
  id: string
  title: string
  filename: string
  filetype: string
  chunk_count: number
  message: string
}

interface UrlUploadRequest {
  url: string
  title?: string
  tags?: string[]
}

interface UrlUploadResponse {
  source_id: string
  filename: string
  pages: number | null
  chunks: number
  status: string
}

// Chat Types
interface ChatRequest {
  query: string
  use_hybrid?: boolean
  top_k?: number
  rerank?: boolean
}

interface ChatResponse {
  query: string
  answer: string
  sources: Array<{
    chunk_id: string
    source_id: string
    filename: string
    relevance_score: number
    text: string
  }>
  chunk_count: number
}

// Council Types
interface CouncilRequest {
  persona: string
  context: string
  question: string
}

interface CouncilResponse {
  persona: string
  persona_name: string
  context: string
  question: string
  advice: string
  timestamp: string
}

// Stats Types
interface StatsResponse {
  total_documents: number
  total_chunks: number
  embedding_model: string
}

// Narratives Types
interface CriteriaScores {
  A_knowing?: number
  B_inquiring?: number
  C_processing?: number
  D_reflecting?: number
}

interface StudentData {
  initials: string
  criteria_scores: CriteriaScores
  units_completed?: string[]
  observations: string[]
  formative_trend?: 'improving' | 'consistent' | 'declining'
  notable_work?: string
}

interface SynthesizeOptions {
  tone?: 'encouraging' | 'neutral' | 'direct'
  include_growth_area?: boolean
  council_review?: string[]
}

interface SynthesizeRequest {
  class_name: string
  semester: string
  rubric_source_id?: string
  students: StudentData[]
  options?: SynthesizeOptions
}

interface NarrativeStructure {
  achievement: string
  evidence: string
  growth: string
  outlook: string
}

interface CriteriaSummary {
  strongest: string
  growth_area: string
}

interface CouncilReviewResult {
  approved: boolean
  notes: string
}

interface StudentNarrative {
  initials: string
  draft: string
  structure: NarrativeStructure
  criteria_summary: CriteriaSummary
  council_review: Record<string, CouncilReviewResult>
  word_count: number
  status: 'ready_for_review' | 'approved' | 'needs_attention' | 'error'
}

interface PatternDetected {
  pattern: string
  description: string
  affected_students: string[]
  suggestion: string
}

interface ClusterInfo {
  cluster_id: string
  pattern: string
  student_initials: string[]
  shared_growth_area: string
}

interface SynthesizeResponse {
  batch_id: string
  class_name: string
  semester: string
  narratives: StudentNarrative[]
  patterns_detected: PatternDetected[]
  processing_time_ms: number
}

interface BatchSubmitResponse {
  batch_id: string
  student_count: number
  status: string
  estimated_time_seconds: number
  webhook_url?: string
}

interface BatchStatusResponse {
  batch_id: string
  status: 'processing' | 'complete' | 'error'
  class_name?: string
  semester?: string
  progress?: { completed: number; total: number }
  narratives: StudentNarrative[]
  clusters: ClusterInfo[]
  patterns_detected: PatternDetected[]
  council_summary: Record<string, string>
}

interface EditResponse {
  initials: string
  status: string
  updated_at: string
}

interface IBCriterion {
  id: string
  name: string
  strand_i?: string
  strand_ii?: string
  strand_iii?: string
  max_score: number
}

interface IBRubricResponse {
  rubric_id: string
  criteria: IBCriterion[]
  loaded: boolean
}

// Export types for use in components
export type {
  StudentData,
  StudentNarrative,
  PatternDetected,
  ClusterInfo,
  SynthesizeRequest,
  SynthesizeResponse,
  BatchStatusResponse,
  IBCriterion,
  CriteriaScores,
  SynthesizeOptions,
}

export const api = {
  // Source Management
  sources: {
    async upload(file: File, title?: string): Promise<ApiResponse<UploadResponse>> {
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (title) {
          formData.append('title', title)
        }

        const response = await fetch(`${API_BASE}/api/v1/sources/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Upload failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Upload failed' }
      }
    },

    async list(): Promise<ApiResponse<Source[]>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/sources`)

        if (!response.ok) {
          return { error: 'Failed to fetch sources' }
        }

        const data = await response.json()
        // Map backend response to frontend expected format
        const sources = (data.sources || []).map((s: any) => ({
          id: s.source_id,
          title: s.filename?.replace(/\.[^/.]+$/, '') || 'Untitled', // Use filename without extension as title
          filename: s.filename,
          filetype: s.filename?.split('.').pop() || 'unknown',
          upload_date: s.created_at,
          size_bytes: s.file_size || 0,
          chunk_count: s.chunk_count || 0,
        }))
        return { data: sources }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch sources' }
      }
    },

    async delete(sourceId: string): Promise<ApiResponse<{ message: string }>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/sources/${sourceId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          return { error: 'Failed to delete source' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to delete source' }
      }
    },

    async stats(): Promise<ApiResponse<StatsResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/sources/stats`)

        if (!response.ok) {
          return { error: 'Failed to fetch stats' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch stats' }
      }
    },

    async uploadUrl(url: string, title?: string, tags?: string[]): Promise<ApiResponse<UrlUploadResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/sources/url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            title: title || undefined,
            tags: tags || [],
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'URL upload failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'URL upload failed' }
      }
    },
  },

  // Chat
  chat: {
    async ask(query: string, options?: Omit<ChatRequest, 'query'>): Promise<ApiResponse<ChatResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            ...options,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Query failed' }
        }

        const data = await response.json()
        // Map backend response format to frontend expected format
        return {
          data: {
            query,
            answer: data.response,
            sources: data.citations || [],
            chunk_count: data.sources_searched || 0,
          }
        }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Query failed' }
      }
    },
  },

  // Inner Council
  council: {
    async consult(persona: string, context: string, question: string): Promise<ApiResponse<CouncilResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/council/consult`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personas: [persona],
            context: {
              type: 'teaching',
              content: context,
            },
            question,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Consultation failed' }
        }

        const data = await response.json()
        // Map backend response to frontend expected format
        const advice = data.advice?.[0]
        return {
          data: {
            persona,
            persona_name: advice?.display_name || persona,
            context,
            question,
            advice: advice?.response ? JSON.stringify(advice.response, null, 2) : 'No advice available',
            timestamp: new Date().toISOString(),
          }
        }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Consultation failed' }
      }
    },

    async listPersonas(): Promise<ApiResponse<Array<{ id: string; name: string; description: string }>>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/council/personas`)

        if (!response.ok) {
          return { error: 'Failed to fetch personas' }
        }

        const data = await response.json()
        return { data: data.personas || [] }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch personas' }
      }
    },
  },

  // Narratives
  narratives: {
    async synthesize(request: SynthesizeRequest): Promise<ApiResponse<SynthesizeResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Synthesis failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Synthesis failed' }
      }
    },

    async submitBatch(request: SynthesizeRequest): Promise<ApiResponse<BatchSubmitResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Batch submission failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Batch submission failed' }
      }
    },

    async getBatchStatus(batchId: string): Promise<ApiResponse<BatchStatusResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/batch/${batchId}`)

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to fetch batch status' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch batch status' }
      }
    },

    async editNarrative(
      batchId: string,
      initials: string,
      draft: string,
      status: 'approved' | 'needs_revision'
    ): Promise<ApiResponse<EditResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/batch/${batchId}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initials, edited_draft: draft, status }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Edit failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Edit failed' }
      }
    },

    async exportBatch(
      batchId: string,
      format: 'csv' | 'txt' | 'json' = 'txt',
      approvedOnly: boolean = false
    ): Promise<ApiResponse<string>> {
      try {
        const params = new URLSearchParams({
          format,
          include_approved_only: approvedOnly.toString(),
        })
        const response = await fetch(
          `${API_BASE}/api/v1/narratives/batch/${batchId}/export?${params}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Export failed' }
        }

        // For txt/csv, return as text; for json, return as parsed object
        if (format === 'json') {
          const data = await response.json()
          return { data: JSON.stringify(data, null, 2) }
        } else {
          const data = await response.text()
          return { data }
        }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Export failed' }
      }
    },

    async loadIBRubric(gradeBand: string = 'MYP3'): Promise<ApiResponse<IBRubricResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/rubric/ib-science`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grade_band: gradeBand, include_descriptors: true }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to load rubric' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to load rubric' }
      }
    },
  },

  // Health Check
  async health(): Promise<ApiResponse<{ status: string; version: string }>> {
    try {
      const response = await fetch(`${API_BASE}/health`)

      if (!response.ok) {
        return { error: 'Health check failed' }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Health check failed' }
    }
  },
}

export default api
