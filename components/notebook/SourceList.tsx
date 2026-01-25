'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

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
  notebookId?: string;
  refreshTrigger?: number;
}

export default function SourceList({ notebookId = 'default', refreshTrigger = 0 }: SourceListProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSources = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.sources.list();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSources(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Delete this source?')) return;

    try {
      const result = await api.sources.delete(sourceId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSources(sources.filter(s => s.id !== sourceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete source');
    }
  };

  useEffect(() => {
    loadSources();
  }, [notebookId, refreshTrigger]);

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading sources...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 p-6 text-center text-sm text-neutral-500">
        No sources uploaded yet. Upload a document to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Sources ({sources.length})</h3>
      <div className="space-y-2">
        {sources.map(source => (
          <div
            key={source.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{source.filename}</div>
              <div className="text-xs text-neutral-500">
                {new Date(source.upload_date).toLocaleDateString()} • {source.chunk_count} chunks
              </div>
            </div>
            <button
              onClick={() => handleDelete(source.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
