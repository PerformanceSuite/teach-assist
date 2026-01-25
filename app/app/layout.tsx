import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const email = session?.user?.email ?? undefined;

  return <Shell userEmail={email}>{children}</Shell>;
}
