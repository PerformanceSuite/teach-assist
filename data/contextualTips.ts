/**
 * Contextual tips shown on different routes
 */

export interface ContextualTip {
  title: string
  message: string
  learnMoreId?: string // Help article ID to link to
}

export const CONTEXTUAL_TIPS: Record<string, ContextualTip> = {
  '/': {
    title: 'Welcome to TeachAssist!',
    message: 'Start by uploading curriculum documents or exploring the Inner Council advisors.',
    learnMoreId: 'getting-started-overview',
  },
  '/sources': {
    title: 'Upload Your Curriculum',
    message: 'Upload standards, textbooks, or lesson plans. TeachAssist will make them searchable.',
    learnMoreId: 'uploading-first-document',
  },
  '/chat': {
    title: 'Ask Grounded Questions',
    message: 'Questions are answered using your uploaded sources. Citations show where answers came from.',
    learnMoreId: 'asking-grounded-questions',
  },
  '/council': {
    title: 'Consult Your Inner Council',
    message: 'Get structured advice from 4 specialized advisors. Choose based on your current challenge.',
    learnMoreId: 'meeting-inner-council',
  },
}
