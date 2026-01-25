'use client';

import { useState } from 'react';
import api from '@/lib/api';

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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await api.chat.ask(userMessage);

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
    <div className="flex flex-col rounded-lg border border-neutral-200">
      {/* Messages */}
      <div className="flex-1 space-y-4 p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Ask a question about your uploaded sources
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-neutral-100 ml-12'
                    : 'bg-blue-50 mr-12'
                }`}
              >
                <div className="text-xs font-medium text-neutral-600 mb-1">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="ml-4 space-y-1">
                  <div className="text-xs font-medium text-neutral-600">Sources:</div>
                  {msg.citations.map((cite, cidx) => (
                    <div
                      key={cidx}
                      className="rounded border border-neutral-200 bg-neutral-50 p-2 text-xs"
                    >
                      <div className="font-medium text-neutral-700">{cite.filename}</div>
                      <div className="text-neutral-600 line-clamp-2">{cite.text}</div>
                      <div className="text-neutral-500 text-[10px] mt-1">
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
          <div className="text-sm text-neutral-500">Assistant is thinking...</div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your sources..."
            className="flex-1 rounded-md border border-neutral-300 p-2 text-sm resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
