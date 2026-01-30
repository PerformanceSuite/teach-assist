/**
 * Help Articles Loader
 *
 * Loads and parses markdown help articles from content/help/ directory.
 * This module provides utilities to read frontmatter and content from
 * help article markdown files.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface HelpArticleMeta {
  id: string
  title: string
  description: string
  category: string
  order: number
  slug: string
}

export interface HelpArticle extends HelpArticleMeta {
  content: string
  tags: string[]
}

export interface HelpCategory {
  id: string
  name: string
  icon: string
  description: string
}

// Category definitions with icons and metadata
export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'Rocket',
    description: 'Learn the basics of TeachAssist',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    icon: 'FileText',
    description: 'Managing your teaching materials',
  },
  {
    id: 'inner-council',
    name: 'Inner Council',
    icon: 'Users',
    description: 'Working with AI advisors',
  },
  {
    id: 'narratives',
    name: 'Narrative Synthesis',
    icon: 'PenTool',
    description: 'Generating report card comments',
  },
  {
    id: 'reference',
    name: 'Reference',
    icon: 'BookOpen',
    description: 'Quick reference guides',
  },
]

// Map of slug to filename for the 15 help articles
const ARTICLE_FILES: Record<string, string> = {
  // Getting Started
  'welcome': 'welcome.md',
  'quick-start': 'quick-start.md',
  'privacy-first': 'privacy-first.md',
  // Knowledge Base
  'uploading-sources': 'uploading-sources.md',
  'asking-questions': 'asking-questions.md',
  'understanding-citations': 'understanding-citations.md',
  'source-transforms': 'source-transforms.md',
  // Inner Council
  'inner-council-intro': 'inner-council-intro.md',
  'choosing-advisors': 'choosing-advisors.md',
  'interpreting-advice': 'interpreting-advice.md',
  // Narratives
  'narrative-overview': 'narrative-overview.md',
  'entering-student-data': 'entering-student-data.md',
  'reviewing-narratives': 'reviewing-narratives.md',
  // Reference
  'ib-criteria': 'ib-criteria.md',
  'keyboard-shortcuts': 'keyboard-shortcuts.md',
}

const HELP_CONTENT_DIR = path.join(process.cwd(), 'content', 'help')

/**
 * Parse markdown file with frontmatter
 */
function parseArticleFile(filename: string): HelpArticle | null {
  const filePath = path.join(HELP_CONTENT_DIR, filename)

  if (!fs.existsSync(filePath)) {
    console.warn(`Help article not found: ${filePath}`)
    return null
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const slug = filename.replace('.md', '')

    // Extract tags from content (look for keywords)
    const tags = extractTags(content, data.category)

    return {
      id: slug,
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      category: data.category || 'reference',
      order: data.order || 99,
      content: content.trim(),
      tags,
    }
  } catch (error) {
    console.error(`Error parsing article ${filename}:`, error)
    return null
  }
}

/**
 * Extract relevant tags from article content and category
 */
function extractTags(content: string, category: string): string[] {
  const tags: string[] = []

  // Add category as a tag
  if (category) {
    tags.push(category.replace('-', ' '))
  }

  // Common teaching keywords to detect
  const keywords = [
    'upload', 'sources', 'chat', 'council', 'advisor', 'standards',
    'differentiation', 'assessment', 'curriculum', 'privacy', 'ferpa',
    'narrative', 'report card', 'grounded', 'citation', 'keyboard',
    'shortcuts', 'ib', 'myp', 'criteria', 'student data', 'feedback'
  ]

  const lowerContent = content.toLowerCase()
  keywords.forEach(keyword => {
    if (lowerContent.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword)
    }
  })

  return tags.slice(0, 8) // Limit to 8 tags
}

/**
 * Load all help articles
 */
export function getAllArticles(): HelpArticle[] {
  const articles: HelpArticle[] = []

  for (const [slug, filename] of Object.entries(ARTICLE_FILES)) {
    const article = parseArticleFile(filename)
    if (article) {
      articles.push(article)
    }
  }

  // Sort by category order, then by article order within category
  const categoryOrder = HELP_CATEGORIES.map(c => c.id)

  return articles.sort((a, b) => {
    const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    if (categoryDiff !== 0) return categoryDiff
    return a.order - b.order
  })
}

/**
 * Get a single article by slug
 */
export function getArticleBySlug(slug: string): HelpArticle | null {
  const filename = ARTICLE_FILES[slug]
  if (!filename) return null
  return parseArticleFile(filename)
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return getAllArticles().filter(article => article.category === categoryId)
}

/**
 * Search articles by query
 */
export function searchArticles(query: string): HelpArticle[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []

  const articles = getAllArticles()

  return articles.filter(article => {
    const searchableText = [
      article.title,
      article.description,
      article.content,
      ...article.tags
    ].join(' ').toLowerCase()

    return searchableText.includes(lowerQuery)
  })
}

/**
 * Get article metadata only (without full content) for listing
 */
export function getArticleMeta(): HelpArticleMeta[] {
  return getAllArticles().map(({ content, tags, ...meta }) => meta)
}

/**
 * Get all categories with article counts
 */
export function getCategoriesWithCounts(): (HelpCategory & { articleCount: number })[] {
  const articles = getAllArticles()

  return HELP_CATEGORIES.map(category => ({
    ...category,
    articleCount: articles.filter(a => a.category === category.id).length,
  }))
}

// For use in data/helpContent.ts compatibility layer
// This allows gradual migration from inline content to markdown files
export function getHelpArticlesForStore(): {
  id: string
  title: string
  category: string
  tags: string[]
  content: string
  relatedArticles?: string[]
}[] {
  return getAllArticles().map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    tags: article.tags,
    content: article.content,
  }))
}
