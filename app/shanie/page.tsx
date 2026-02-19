'use client'

import Link from 'next/link';
import { GraduationCap, Home } from 'lucide-react';

const HOUSE_URL = process.env.NEXT_PUBLIC_HOUSE_URL || 'http://localhost:5180';

export default function ShanieHub() {
  return (
    <div className="min-h-screen bg-cc-bg flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-cc-text mb-2">Shanie Holman</h1>
        <p className="text-cc-muted">Choose where you&apos;d like to go</p>
        <Link
          href="/shanieholman"
          className="inline-block mt-3 text-sm text-cc-accent hover:underline"
        >
          View public profile &rarr;
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {/* Teach card */}
        <Link
          href="/"
          className="group flex flex-col items-center gap-4 p-8 bg-cc-surface border border-cc-border rounded-2xl hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
        >
          <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
            <GraduationCap className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-cc-text mb-1">Teach</h2>
            <p className="text-sm text-cc-muted">TeachAssist tools &amp; planning</p>
          </div>
        </Link>

        {/* House card */}
        <a
          href={HOUSE_URL}
          className="group flex flex-col items-center gap-4 p-8 bg-cc-surface border border-cc-border rounded-2xl hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
        >
          <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
            <Home className="h-10 w-10 text-indigo-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-cc-text mb-1">House</h2>
            <p className="text-sm text-cc-muted">Property Manager</p>
          </div>
        </a>
      </div>
    </div>
  );
}
