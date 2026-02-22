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

// Student Types
export interface StudentProfile {
  id: string
  name: string  // Use anonymized names (e.g., "Alex M.")
  interests: string[]
  accommodations: string[]  // IEP/504 accommodations
  created_at: string
  updated_at: string
}

export interface StudentCreate {
  name: string
  interests?: string[]
  accommodations?: string[]
}

export interface StudentUpdate {
  name?: string
  interests?: string[]
  accommodations?: string[]
}

// Chat Types
interface ChatRequest {
  query: string
  use_hybrid?: boolean
  top_k?: number
  rerank?: boolean
  student_ids?: string[]
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

// Rubric Template Types
interface RubricTemplateCriterion {
  id: string
  name: string
  strand_i?: string
  strand_ii?: string
  strand_iii?: string
  max_score: number
}

interface RubricTemplate {
  template_id: string
  name: string
  subject: string
  description: string
  criteria: RubricTemplateCriterion[]
  is_builtin: boolean
  created_at?: string
}

// Narratives Types
interface CriteriaScores {
  A_knowing?: number
  B_inquiring?: number
  C_processing?: number
  D_reflecting?: number
  // Design Technology
  A_inquiring?: number
  B_developing?: number
  C_creating?: number
  D_evaluating?: number
  // Math
  B_investigating?: number
  C_communicating?: number
  D_applying?: number
  // I&S
  D_thinking?: number
  [key: string]: number | undefined
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
  rubric_template_id?: string
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

// Grading Types
interface StudentWork {
  student_id: string
  content: string
  submission_type?: 'text' | 'description' | 'summary'
}

interface GradeBatchRequest {
  rubric_template_id?: string
  assignment_name: string
  assignment_context?: string
  submissions: StudentWork[]
}

interface FeedbackDraft {
  student_id: string
  strengths: string[]
  growth_areas: string[]
  evidence: string[]
  next_steps: string[]
  draft_comment: string
  criteria_alignment: Record<string, string>
  status: 'ready_for_review' | 'approved' | 'edited'
  word_count: number
}

interface GradeBatchResponse {
  batch_id: string
  submission_count: number
  status: string
  estimated_time_seconds: number
}

interface GradeBatchStatusResponse {
  batch_id: string
  assignment_name: string
  status: 'processing' | 'complete' | 'error'
  progress?: { completed: number; total: number }
  feedback: FeedbackDraft[]
  rubric_template_id?: string
}

interface FeedbackEditResponse {
  student_id: string
  status: string
  updated_at: string
}

// Transform Types
type TransformType = 'summarize' | 'extract_misconceptions' | 'map_standards' | 'generate_questions' | 'simplify_language'

interface TransformOptions {
  audience?: 'students' | 'teachers'
  length?: 'short' | 'medium' | 'long'
  count?: number
  grade_level?: string
}

interface TransformRequest {
  transform: TransformType
  source_ids?: string[]
  options?: TransformOptions
  notebook_id?: string
}

interface TransformResponse {
  transform: string
  result: string
  sources_used: string[]
  metadata: Record<string, unknown>
}

// Planning Types
interface UnitConstraints {
  lab_days_per_week?: number
  materials_budget?: 'limited' | 'standard' | 'flexible'
  max_homework_minutes?: number
}

interface UnitCreate {
  title: string
  grade: number
  subject: string
  duration_weeks: number
  standards: string[]
  constraints?: UnitConstraints
}

interface GRASPS {
  goal: string
  role: string
  audience: string
  situation: string
  product: string
  standards: string
}

interface PerformanceTask {
  grasps: GRASPS
}

interface LessonOutline {
  lesson: number
  title: string
  type: string
  activities: string[]
}

interface UnitResponse {
  unit_id: string
  title: string
  transfer_goals: string[]
  essential_questions: string[]
  performance_task: PerformanceTask
  lesson_sequence: LessonOutline[]
  status: string
}

interface LessonSection {
  duration: number
  activity: string
  key_points?: string[]
}

interface LessonPlan {
  opening: LessonSection
  instruction: LessonSection
  practice: LessonSection
  closing: LessonSection
}

interface LessonCreate {
  unit_id?: string
  lesson_number?: number
  topic: string
  duration_minutes?: number
  format?: 'minimum_viable' | 'detailed' | 'stretch'
  student_ids?: string[]
}

interface LessonResponse {
  lesson_id: string
  title: string
  learning_target: string
  plan: LessonPlan
  materials: string[]
  differentiation_notes: string
  format: string
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
  RubricTemplate,
  RubricTemplateCriterion,
  StudentWork,
  FeedbackDraft,
  GradeBatchRequest,
  GradeBatchResponse,
  GradeBatchStatusResponse,
  TransformType,
  TransformOptions,
  TransformRequest,
  TransformResponse,
  UnitCreate,
  UnitResponse,
  LessonCreate,
  LessonResponse,
  UnitConstraints,
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

  // Student Management
  students: {
    async list(): Promise<ApiResponse<StudentProfile[]>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/students`)

        if (!response.ok) {
          return { error: 'Failed to fetch students' }
        }

        const data = await response.json()
        return { data: data.students || data || [] }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch students' }
      }
    },

    async create(data: StudentCreate): Promise<ApiResponse<StudentProfile>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to create student' }
        }

        const result = await response.json()
        return { data: result }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to create student' }
      }
    },

    async get(id: string): Promise<ApiResponse<StudentProfile>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/students/${id}`)

        if (!response.ok) {
          return { error: 'Failed to fetch student' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch student' }
      }
    },

    async update(id: string, data: StudentUpdate): Promise<ApiResponse<StudentProfile>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/students/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to update student' }
        }

        const result = await response.json()
        return { data: result }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to update student' }
      }
    },

    async delete(id: string): Promise<ApiResponse<{ message: string }>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/students/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          return { error: 'Failed to delete student' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to delete student' }
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

    async transform(
      transform: TransformType,
      sourceIds?: string[],
      options?: TransformOptions
    ): Promise<ApiResponse<TransformResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/chat/transform`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transform,
            source_ids: sourceIds || [],
            options: options || {},
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Transform failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Transform failed' }
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

    async listRubricTemplates(): Promise<ApiResponse<RubricTemplate[]>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/rubrics`)

        if (!response.ok) {
          return { error: 'Failed to fetch rubric templates' }
        }

        const data = await response.json()
        return { data: data.templates || [] }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch rubric templates' }
      }
    },

    async getRubricTemplate(templateId: string): Promise<ApiResponse<RubricTemplate>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/rubrics/${templateId}`)

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to fetch rubric template' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch rubric template' }
      }
    },

    async createCustomRubric(rubric: {
      name: string
      subject: string
      description?: string
      criteria: Array<{ id: string; name: string; max_score?: number }>
    }): Promise<ApiResponse<RubricTemplate>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/narratives/rubrics/custom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rubric),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to create custom rubric' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to create custom rubric' }
      }
    },
  },

  // Grading
  grading: {
    async submitBatch(request: GradeBatchRequest): Promise<ApiResponse<GradeBatchResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/grading/batch`, {
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

    async getBatchStatus(batchId: string): Promise<ApiResponse<GradeBatchStatusResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/grading/batch/${batchId}`)

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

    async editFeedback(
      batchId: string,
      studentId: string,
      draftComment: string,
      status: 'approved' | 'edited'
    ): Promise<ApiResponse<FeedbackEditResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/grading/batch/${batchId}/feedback`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: studentId, draft_comment: draftComment, status }),
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
        const params = new URLSearchParams({ format, approved_only: approvedOnly.toString() })
        const response = await fetch(`${API_BASE}/api/v1/grading/batch/${batchId}/export?${params}`)

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Export failed' }
        }

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
  },

  // Planning
  planning: {
    async createUnit(data: UnitCreate): Promise<ApiResponse<UnitResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/planning/units`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to create unit' }
        }

        const result = await response.json()
        return { data: result }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to create unit' }
      }
    },

    async createLesson(data: LessonCreate): Promise<ApiResponse<LessonResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/planning/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Failed to create lesson' }
        }

        const result = await response.json()
        return { data: result }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to create lesson' }
      }
    },

    async listUnits(): Promise<ApiResponse<UnitResponse[]>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/planning/units`)

        if (!response.ok) {
          return { error: 'Failed to fetch units' }
        }

        const data = await response.json()
        return { data: data.units || data || [] }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch units' }
      }
    },

    async getUnit(unitId: string): Promise<ApiResponse<UnitResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/planning/units/${unitId}`)

        if (!response.ok) {
          return { error: 'Failed to fetch unit' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch unit' }
      }
    },

    async listLessons(unitId?: string): Promise<ApiResponse<LessonResponse[]>> {
      try {
        const params = unitId ? `?unit_id=${unitId}` : ''
        const response = await fetch(`${API_BASE}/api/v1/planning/lessons${params}`)

        if (!response.ok) {
          return { error: 'Failed to fetch lessons' }
        }

        const data = await response.json()
        return { data: data.lessons || data || [] }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to fetch lessons' }
      }
    },

    async deleteUnit(unitId: string): Promise<ApiResponse<{ message: string }>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/planning/units/${unitId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          return { error: 'Failed to delete unit' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to delete unit' }
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
