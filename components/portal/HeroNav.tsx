'use client'

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface HeroNavProps {
  teacherName: string;
}

export default function HeroNav({ teacherName }: HeroNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-cc-surface/80 backdrop-blur-md border-b border-cc-border/50">
      <div className="max-w-4xl mx-auto h-full flex items-center justify-between px-4">
        <span className="text-lg font-bold text-cc-text">{teacherName}</span>
        <Link
          href="/shanie"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-cc-muted hover:text-cc-text border border-cc-border rounded-lg hover:border-cc-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </div>
    </header>
  );
}
