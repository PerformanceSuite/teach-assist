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
