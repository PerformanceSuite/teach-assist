/**
 * GlobalLayout - Client-side layout with navigation, keyboard shortcuts and global UI
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
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
} from 'lucide-react'
import { ChangePasswordModal } from './ChangePasswordModal'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useAIAssistantStore } from '../stores/aiAssistantStore'
import { useHelpStore } from '../stores/helpStore'
import { AIAssistantPanel, AIAssistantFAB } from './AIAssistant'
import { HelpCenter } from './HelpCenter'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sources', label: 'Knowledge Base', icon: BookOpen },
  { href: '/students', label: 'Students', icon: UsersRound },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/council', label: 'Inner Council', icon: Users },
  { href: '/narratives', label: 'Narratives', icon: FileText },
  { href: '/app/plan', label: 'Plan Studio', icon: Calendar },
  { href: '/app/grade', label: 'Grade Studio', icon: GraduationCap },
  { href: '/profile', label: 'Public Profile', icon: UserPen },
]

function GlobalLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toggleAssistant } = useAIAssistantStore()
  const { toggleHelp } = useHelpStore()
  const isEmbedded = searchParams.get('embedded') === 'true'

  const [user, setUser] = useState<User | null>(null)
  const [showChangePassword, setShowChangePassword] = useState(false)

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors">
      {/* Header - hidden when embedded in portal iframe */}
      {!isEmbedded && (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href="/shanie"
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Back to Shanie hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/" className="font-semibold text-gray-900 dark:text-white tracking-tight text-lg">
                TeachAssist
              </Link>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ThemeToggle />
              {user && (
                <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 pl-2 pr-3 py-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.email?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 hidden md:inline font-medium">
                    {user.email}
                  </span>
                </div>
              )}
              <button
                className="flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setShowChangePassword(true)}
                title="Change password"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mx-auto max-w-6xl px-4 pb-3">
            <div className="flex flex-wrap gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>

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
