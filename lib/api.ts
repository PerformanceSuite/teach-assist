/**
 * TeachAssist API Client
 *
 * Client-side functions for calling the Python backend API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

// Types
export interface Source {
  source_id: string;
  filename: string;
  created_at: string;
  chunks: number;
  tags: string[];
}

export interface SourceDetail extends Source {
  preview: string;
  metadata: Record<string, any>;
}

export interface Citation {
  source_id: string;
  chunk_id: string;
  text: string;
  page?: number;
  relevance: number;
}

export interface ChatMessage {
  notebook_id?: string;
  message: string;
  conversation_id?: string;
  include_citations?: boolean;
}

export interface ChatResponse {
  response: string;
  citations: Citation[];
  conversation_id: string;
  grounded: boolean;
}

export interface UploadResponse {
  source_id: string;
  filename: string;
  pages?: number;
  chunks: number;
  status: string;
}

// API Functions

/**
 * Upload a document to the knowledge base
 */
export async function uploadDocument(
  file: File,
  notebookId: string = 'default',
  metadata?: Record<string, any>
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('notebook_id', notebookId);

  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/sources/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List all sources
 */
export async function listSources(
  notebookId?: string,
  tag?: string
): Promise<{ sources: Source[]; total: number }> {
  const params = new URLSearchParams();
  if (notebookId) params.append('notebook_id', notebookId);
  if (tag) params.append('tag', tag);

  const url = `${API_BASE_URL}/api/v1/sources${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to list sources: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get source details
 */
export async function getSource(sourceId: string): Promise<SourceDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sources/${sourceId}`);

  if (!response.ok) {
    throw new Error(`Failed to get source: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a source
 */
export async function deleteSource(sourceId: string): Promise<{ deleted: boolean; source_id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sources/${sourceId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete source: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send a chat message and get grounded response
 */
export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{ status: string; version: string; services: Record<string, string> }> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Inner Council - Consult a persona
 */
export async function consultCouncil(
  persona: string,
  contextContent: string,
  question: string
): Promise<{ advice: Array<{ persona: string; display_name: string; response: any }>; context_received: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/council/consult`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personas: [persona],
      context: {
        type: 'lesson_plan',
        content: contextContent,
      },
      question,
    }),
  });

  if (!response.ok) {
    throw new Error(`Council consultation failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get list of available council personas
 */
export async function getPersonas(): Promise<{
  personas: Array<{ id: string; name: string; role: string; expertise: string[] }>
}> {
  const response = await fetch(`${API_BASE_URL}/api/v1/council/personas`);

  if (!response.ok) {
    throw new Error(`Failed to fetch personas: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform backend schema to frontend schema
  return {
    personas: data.personas.map((p: any) => ({
      id: p.name,
      name: p.display_name,
      role: p.description,
      expertise: p.tags,
    })),
  };
}
