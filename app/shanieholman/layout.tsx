import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shanie Holman',
  description: 'Meet the Teacher - Shanie Holman',
};

export default function ShanieHolmanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
