'use client';

import { useEffect, useState } from 'react';
import { listSources, deleteSource, type Source } from '@/lib/api';

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
      const result = await listSources(notebookId);
      setSources(result.sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Delete this source?')) return;

    try {
      await deleteSource(sourceId);
      setSources(sources.filter(s => s.source_id !== sourceId));
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
            key={source.source_id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{source.filename}</div>
              <div className="text-xs text-neutral-500">
                {new Date(source.created_at).toLocaleDateString()} • {source.chunks} chunks
              </div>
            </div>
            <button
              onClick={() => handleDelete(source.source_id)}
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
