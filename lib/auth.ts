import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function parseAllowlist(value: string | undefined): Set<string> {
  const raw = (value ?? "").trim();
  if (!raw) return new Set();
  return new Set(raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean));
}

const allowedEmails = parseAllowlist(process.env.TEACHASSIST_ALLOWED_EMAILS);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // You can add additional authorization params here if needed
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      if (!email) return false;

      // Friend-only pilot: if allowlist is empty, allow all (local dev convenience).
      if (allowedEmails.size === 0) return true;

      return allowedEmails.has(email);
    },
  },
};
