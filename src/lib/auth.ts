import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      // Only allow admins (your GitHub ID) to sign in
      const adminId = process.env.ADMIN_GITHUB_ID;
      if (!adminId) return false;
      return String(profile?.id) === adminId || profile?.login === adminId;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.githubId = profile.id;
        token.login = profile.login;
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: { strategy: "jwt" },
});
