import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginApi } from "@/lib/api-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        try {
          const result = await loginApi(username, password);

          return {
            id: result.user.id,
            name: result.user.name,
            email: username,
            // Store the API token for subsequent API calls
            apiToken: result.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.apiToken = (user as Record<string, unknown>).apiToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.apiToken = token.apiToken as string;
      }
      return session;
    },
  },
});
