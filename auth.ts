import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";
import { emailVerificationRequired } from "@/lib/auth/email-verification";
import { isValidTimeZone } from "@/lib/timezone";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { type: "email" },
      password: { type: "password" },
    },
    async authorize(credentials, request) {
      if (!(await consumeRateLimit(requestRateLimitKey(request, "credentials-login"), { capacity: 8, refillPerSecond: 0.05 }))) {
        return null;
      }
      const email = String(credentials.email ?? "").trim().toLowerCase();
      const password = String(credentials.password ?? "");
      if (!email || !password) return null;
      const user = await db.user.findUnique({ where: { email } });
      if (emailVerificationRequired() && !user?.emailVerified) return null;
      if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return null;
      return { id: user.id, name: user.displayName || user.name, email: user.email, image: user.avatarUrl || user.image };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        if (!profile.email || !profile.email_verified) {
          throw new Error("Google did not provide a verified email address.");
        }
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/signin" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const requestedTimezone = (await cookies()).get("ascend-oauth-timezone")?.value;
      await db.$transaction([
        ...(requestedTimezone && isValidTimeZone(requestedTimezone)
          ? [db.user.update({ where: { id: user.id }, data: { timezone: requestedTimezone } })]
          : []),
        db.userStats.upsert({
          where: { userId: user.id },
          update: {},
          create: { user: { connect: { id: user.id } } },
        }),
      ]);
    },
  },
});
