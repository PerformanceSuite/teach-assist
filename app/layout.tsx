import type { Metadata } from "next";
import "./globals.css";
import { GlobalLayout } from "../components/GlobalLayout";

export const metadata: Metadata = {
  title: "TeachAssist",
  description: "Teacher-first professional operating system (pilot).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cc-bg text-cc-text antialiased min-h-screen">
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  );
}
