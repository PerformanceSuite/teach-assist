import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shanie Holman',
  description: 'Shanie Holman - Teach & House',
};

export default function ShanieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
