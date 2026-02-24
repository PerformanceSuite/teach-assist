/**
 * GlobalLayout - Client-side layout with navigation, keyboard shortcuts and global UI
 */

'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  Home,
  BookOpen,
  MessageSquare,
  Users,
  UsersRound,
  Calendar,
  GraduationCap,
  FileText,
  UserPen,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  Menu,
  X,
} from 'lucide-react'
import { ChangePasswordModal } from './ChangePasswordModal'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useAIAssistantStore } from '../stores/aiAssistantStore'
import { useHelpStore } from '../stores/helpStore'
import { AIAssistantPanel, AIAssistantFAB } from './AIAssistant'
import { HelpCenter } from './HelpCenter'
import { ThemeToggle } from './ThemeToggle'

const primaryNav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sources', label: 'Knowledge Base', icon: BookOpen },
  { href: '/app/plan', label: 'Plan Studio', icon: Calendar },
  { href: '/narratives', label: 'Narratives', icon: FileText },
  { href: '/app/grade', label: 'Grade Studio', icon: GraduationCap },
]

const secondaryNav = [
  { href: '/students', label: 'Students', icon: UsersRound },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
]

const allNavItems = [...primaryNav, ...secondaryNav]

function GlobalLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toggleAssistant } = useAIAssistantStore()
  const { toggleHelp } = useHelpStore()
  const isEmbedded = searchParams.get('embedded') === 'true'

  const [user, setUser] = useState<User | null>(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleMobileNav = useCallback(() => setMobileNavOpen(prev => !prev), [])
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Set up keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '.',
      metaKey: true,
      handler: toggleAssistant,
      description: 'Toggle AI Assistant',
    },
    {
      key: '/',
      metaKey: true,
      handler: toggleHelp,
      description: 'Toggle Help Center',
    },
    {
      key: 'u',
      metaKey: true,
      handler: () => router.push('/sources'),
      description: 'Go to Upload Sources',
    },
    {
      key: 'j',
      metaKey: true,
      handler: () => router.push('/chat'),
      description: 'Go to Chat',
    },
    {
      key: 'c',
      metaKey: true,
      shiftKey: true,
      handler: () => router.push('/council'),
      description: 'Go to Inner Council',
    },
  ])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-white focus:text-black z-50 rounded shadow">
        Skip to main content
      </a>

      {/* Sidebar - Desktop */}
      {!isEmbedded && (
        <aside
          className={`hidden md:flex flex-col bg-white dark:bg-cc-surface border-r border-gray-200 dark:border-gray-800 transition-[width] duration-300 ease-in-out shadow-sm z-40 sticky top-0 h-screen ${isSidebarOpen ? 'w-64' : 'w-20'
            }`}
        >
          <div className={`p-5 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white tracking-tight text-xl" title="TeachAssist Home">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </span>
              {isSidebarOpen && <span className="truncate">TeachAssist</span>}
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2">
            <nav aria-label="Main navigation" className="space-y-6">
              {/* Primary Workflows */}
              <div>
                {isSidebarOpen && (
                  <h3 className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Workspaces</h3>
                )}
                <ul className="space-y-1">
                  {primaryNav.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={isSidebarOpen ? undefined : item.label}
                          className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group ${isSidebarOpen ? 'gap-3' : 'justify-center'
                            } ${isActive
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                          {isSidebarOpen && <span className="truncate">{item.label}</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Secondary Navigation */}
              <div>
                {isSidebarOpen && (
                  <h3 className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Tools</h3>
                )}
                <ul className="space-y-1">
                  {secondaryNav.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={isSidebarOpen ? undefined : item.label}
                          className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group ${isSidebarOpen ? 'gap-3' : 'justify-center'
                            } ${isActive
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                          {isSidebarOpen && <span className="truncate">{item.label}</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
          </div>

          <div className={`p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-cc-surface/50 transition-all ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
            <div className={`flex gap-3 ${isSidebarOpen ? 'flex-col' : 'flex-col items-center'}`}>
              <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'flex-col gap-4'}`}>
                {/* Theme toggle hides text label internally if we want, but we'll let it be for now */}
                <div className={isSidebarOpen ? '' : 'bg-transparent shadow-none'}>
                  <ThemeToggle />
                </div>

                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow"
                  title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                  aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>

              {user && (
                <div className={`flex items-center gap-3 py-1.5 ${isSidebarOpen ? 'px-2' : 'flex-col justify-center'}`}>
                  <Link href="/profile" className="relative group shrink-0" title="View Profile">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all">
                      {user.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white dark:bg-cc-surface rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                  </Link>

                  {isSidebarOpen && (
                    <Link href="/profile" className="flex-1 min-w-0 pr-2 group p-1 -ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase md:tracking-wider">View Profile</p>
                    </Link>
                  )}

                  <div className={`flex ${isSidebarOpen ? 'items-center gap-1' : 'flex-col items-center gap-2 mt-2 w-full pt-2 border-t border-gray-200 dark:border-gray-800'}`}>
                    {isSidebarOpen && (
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Change Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Header & Nav */}
      {!isEmbedded && (
        <div className="md:hidden sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pt-safe-top">
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <span className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </span>
              TeachAssist
            </Link>
            <button
              onClick={toggleMobileNav}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileNavOpen && (
            <div className="absolute top-full left-0 right-0 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 shadow-xl">
              <nav className="space-y-4">
                <ul className="space-y-1">
                  {allNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <ThemeToggle />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium px-4 py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto w-full max-w-[100vw] min-w-0" role="main">
        {/* Adds padding-top to account for clear layout on mobile, but flex-1 handles desktop */}
        <div className="w-full min-w-0 mx-auto md:p-6 lg:p-8 min-h-full">
          {children}
        </div>
      </main>

      <div aria-live="polite" aria-atomic="true" className="sr-only" id="status-announcements" />

      {/* Global UI */}
      <AIAssistantFAB />
      <AIAssistantPanel />
      <HelpCenter />
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
}

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}>
      <GlobalLayoutInner>{children}</GlobalLayoutInner>
    </Suspense>
  )
}

export default GlobalLayout
