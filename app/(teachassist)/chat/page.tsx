/**
 * Chat Page - Ask questions and get grounded answers from your knowledge base
 */

'use client'

import { MessageSquare } from 'lucide-react'
import ChatPanel from '@/components/notebook/ChatPanel'

export default function ChatPage() {
  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Chat</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-3xl">
            Ask questions about your uploaded sources. All answers are grounded in your
            knowledge base and include citations for verification.
          </p>
        </div>

        {/* Example questions */}
        <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example questions:</div>
          <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <li>• What are the key learning objectives in this unit?</li>
            <li>• How can I differentiate this lesson for advanced learners?</li>
            <li>• What assessment strategies are recommended for this standard?</li>
            <li>• Summarize the main concepts in Chapter 3</li>
          </ul>
        </div>

        {/* Chat interface */}
        <ChatPanel />

        {/* Help text */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/50 p-4 text-sm text-blue-600 dark:text-blue-400">
          <div className="font-medium mb-1">💡 Grounded Responses</div>
          <p className="text-gray-500 dark:text-gray-400">
            Every answer includes citations from your uploaded sources. Click on citations
            to see the exact text used to generate the response. If the AI can&apos;t find
            relevant information, it will let you know.
          </p>
        </div>
      </div>
    </div>
  )
}
