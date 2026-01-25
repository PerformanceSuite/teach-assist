'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface UploadResponse {
  id: string
  title: string
  filename: string
  filetype: string
  chunk_count: number
  message: string
}

interface SourceUploaderProps {
  notebookId?: string;
  onUploadComplete?: (result: UploadResponse) => void;
}

export default function SourceUploader({ notebookId = 'default', onUploadComplete }: SourceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await api.sources.upload(file);

      if (result.error) {
        setError(result.error);
        setUploading(false);
        return;
      }

      if (result.data) {
        onUploadComplete?.(result.data);
      }

      // Reset input
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="text-sm text-neutral-600">
          Upload documents to your knowledge base
        </div>

        <label className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800">
          {uploading ? 'Uploading...' : 'Choose File'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        <div className="text-xs text-neutral-500">
          Supported: PDF, DOCX, TXT, MD
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
