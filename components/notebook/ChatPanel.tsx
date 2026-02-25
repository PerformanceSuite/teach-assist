'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useStudentsStore } from '@/stores/studentsStore';
import StudentSelector from '@/components/Chat/StudentSelector';

interface Citation {
  chunk_id: string
  source_id: string
  filename: string
  relevance_score: number
  text: string
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface ChatPanelProps {
  notebookId?: string;
}

export default function ChatPanel({ notebookId = 'default' }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedStudentIds = useStudentsStore((state) => state.selectedStudentIds);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await api.chat.ask(userMessage, {
        student_ids: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
      });

      if (result.error) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${result.error}`,
          },
        ]);
        setLoading(false);
        return;
      }

      if (result.data) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: result.data!.answer,
            citations: result.data!.sources,
          },
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 space-y-4 p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            Ask a question about your uploaded sources
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-gray-100 dark:bg-gray-800 ml-12'
                    : 'bg-blue-50 dark:bg-blue-900/30 mr-12'
                }`}
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{msg.content}</div>
              </div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="ml-4 space-y-1">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Sources:</div>
                  {msg.citations.map((cite, cidx) => (
                    <div
                      key={cidx}
                      className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs"
                    >
                      <div className="font-medium text-gray-700 dark:text-gray-300">{cite.filename}</div>
                      <div className="text-gray-600 dark:text-gray-400 line-clamp-2">{cite.text}</div>
                      <div className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">
                        Relevance: {(cite.relevance_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="text-sm text-gray-400 dark:text-gray-500">Assistant is thinking...</div>
        )}
      </div>

      {/* Student Selector */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 pb-2">
        <StudentSelector />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your sources..."
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 text-sm resize-none placeholder-gray-400"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
