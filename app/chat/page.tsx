/**
 * Chat Page - Ask questions and get grounded answers from your knowledge base
 */

'use client'

import ChatPanel from '@/components/notebook/ChatPanel'

export default function ChatPage() {
  return (
    <div className="h-full overflow-auto p-6 bg-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">AI Chat</h1>
          <p className="text-sm text-neutral-600">
            Ask questions about your uploaded sources. All answers are grounded in your
            knowledge base and include citations for verification.
          </p>
        </div>

        {/* Example questions */}
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
          <div className="text-sm font-medium text-neutral-900 mb-2">Example questions:</div>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• What are the key learning objectives in this unit?</li>
            <li>• How can I differentiate this lesson for advanced learners?</li>
            <li>• What assessment strategies are recommended for this standard?</li>
            <li>• Summarize the main concepts in Chapter 3</li>
          </ul>
        </div>

        {/* Chat interface */}
        <ChatPanel />

        {/* Help text */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <div className="font-medium mb-1">💡 Grounded Responses</div>
          <p>
            Every answer includes citations from your uploaded sources. Click on citations
            to see the exact text used to generate the response. If the AI can't find
            relevant information, it will let you know.
          </p>
        </div>
      </div>
    </div>
  )
}
