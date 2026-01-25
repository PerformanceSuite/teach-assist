import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeachAssist",
  description: "Teacher-first professional operating system (pilot).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
