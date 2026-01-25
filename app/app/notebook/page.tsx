'use client';

import { useState } from 'react';
import SourceUploader from '@/components/notebook/SourceUploader';
import SourceList from '@/components/notebook/SourceList';
import ChatPanel from '@/components/notebook/ChatPanel';

export default function Page() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    // Trigger source list refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notebook Mode</h1>
        <p className="text-neutral-700">
          Upload sources and ask grounded questions (NotebookLM-compatible workflow)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Sources */}
        <div className="space-y-4">
          <SourceUploader onUploadComplete={handleUploadComplete} />
          <SourceList refreshTrigger={refreshTrigger} />
        </div>

        {/* Right Column: Chat */}
        <div>
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
