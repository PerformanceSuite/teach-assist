import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "TeachAssist",
  description: "Teacher-first AI assistant with grounded Q&A and advisory personas",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TeachAssist',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'TeachAssist',
    title: 'TeachAssist',
    description: 'Teacher-first AI assistant with grounded Q&A and advisory personas',
  },
  twitter: {
    card: 'summary',
    title: 'TeachAssist',
    description: 'Teacher-first AI assistant with grounded Q&A and advisory personas',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased min-h-screen transition-colors">
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
