/**
 * HelpCenter - Slide-in help panel with searchable documentation
 */

'use client'

import { useMemo } from 'react'
import {
  X,
  Search,
  ArrowLeft,
  Rocket,
  Map,
  Target,
  Compass,
  ListTodo,
  Keyboard,
  ChevronRight,
  BookOpen,
  FileText,
  Users,
  PenTool
} from 'lucide-react'
import { useHelpStore } from '../../stores/helpStore'
import {
  HELP_CATEGORIES,
  HELP_ARTICLES,
  getArticlesByCategory,
  searchArticles,
  HelpArticle,
  HelpCategory
} from '../../data/helpContent'

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket,
  Map,
  Target,
  Compass,
  ListTodo,
  Keyboard,
  FileText,
  Users,
  PenTool,
  BookOpen,
}

export function HelpCenter() {
  const {
    isOpen,
    closeHelp,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    selectedArticleId,
    selectArticle,
    goBack,
    viewedArticles
  } = useHelpStore()

  // Get search results or category articles
  const displayedArticles = useMemo(() => {
    if (searchQuery) {
      return searchArticles(searchQuery)
    }
    if (activeCategory) {
      return getArticlesByCategory(activeCategory)
    }
    return []
  }, [searchQuery, activeCategory])

  // Get selected article
  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return null
    return HELP_ARTICLES.find(a => a.id === selectedArticleId) || null
  }, [selectedArticleId])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeHelp}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-cc-bg border-l border-cc-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-cc-border flex items-center justify-between bg-cc-surface">
          <div className="flex items-center gap-2">
            {(selectedArticle || activeCategory) && (
              <button
                onClick={() => selectedArticle ? goBack() : setActiveCategory(null)}
                className="p-1 hover:bg-cc-bg rounded transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-medium text-white">Help Center</h2>
          </div>
          <button
            onClick={closeHelp}
            className="p-1 hover:bg-cc-bg rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        {!selectedArticle && (
          <div className="px-4 py-3 border-b border-cc-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full bg-cc-surface border border-cc-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedArticle ? (
            // Article View
            <ArticleView article={selectedArticle} />
          ) : searchQuery || activeCategory ? (
            // Article List
            <ArticleList
              articles={displayedArticles}
              viewedArticles={viewedArticles}
              onSelect={selectArticle}
              categoryName={activeCategory ? HELP_CATEGORIES.find(c => c.id === activeCategory)?.name : 'Search Results'}
            />
          ) : (
            // Category List
            <CategoryList
              categories={HELP_CATEGORIES}
              onSelect={setActiveCategory}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-cc-border bg-cc-surface/50">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-cc-bg border border-cc-border rounded text-gray-400">Cmd+/</kbd> to toggle help
          </p>
        </div>
      </div>
    </>
  )
}

// Category List Component
function CategoryList({
  categories,
  onSelect
}: {
  categories: HelpCategory[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Categories</h3>
      <div className="space-y-2">
        {categories.map(category => {
          const Icon = ICON_MAP[category.icon] || BookOpen
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="w-full p-3 bg-cc-surface hover:bg-cc-surface/80 border border-cc-border rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cc-bg rounded-lg">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{category.name}</div>
                  <div className="text-sm text-gray-400">{category.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Article List Component
function ArticleList({
  articles,
  viewedArticles,
  onSelect,
  categoryName
}: {
  articles: HelpArticle[]
  viewedArticles: string[]
  onSelect: (id: string) => void
  categoryName?: string
}) {
  if (articles.length === 0) {
    return (
      <div className="p-8 text-center">
        <Search className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No articles found</p>
        <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {categoryName && (
        <h3 className="text-sm font-medium text-gray-400 mb-3">{categoryName}</h3>
      )}
      <div className="space-y-2">
        {articles.map(article => (
          <button
            key={article.id}
            onClick={() => onSelect(article.id)}
            className="w-full p-3 bg-cc-surface hover:bg-cc-surface/80 border border-cc-border rounded-lg transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{article.title}</span>
                  {viewedArticles.includes(article.id) && (
                    <span className="text-xs text-gray-500">Viewed</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-gray-500 bg-cc-bg px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Article View Component
function ArticleView({ article }: { article: HelpArticle }) {
  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={i} className="font-semibold text-white mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h4>
        )
      }
      // List items
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="text-gray-300 ml-4">
            {renderInline(line.substring(2))}
          </li>
        )
      }
      // Numbered list items
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={i} className="text-gray-300 ml-4 list-decimal">
            {renderInline(line.replace(/^\d+\.\s/, ''))}
          </li>
        )
      }
      // Empty lines
      if (!line.trim()) {
        return <br key={i} />
      }
      // Regular paragraphs
      return (
        <p key={i} className="text-gray-300 mb-2">
          {renderInline(line)}
        </p>
      )
    })
  }

  // Inline formatting (bold, code)
  const renderInline = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 bg-cc-bg border border-cc-border rounded text-indigo-300 text-sm">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-white mb-4">{article.title}</h2>
      <div className="prose prose-invert max-w-none">
        {renderContent(article.content)}
      </div>
      {article.tags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-cc-border">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-400 bg-cc-surface px-2 py-1 rounded-full border border-cc-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpCenter
