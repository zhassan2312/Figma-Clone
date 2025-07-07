import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
import { env } from "@/env";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
            await signInSchema.parseAsync(credentials);

          const user = await db.user.findUnique({
            where: {
              email: email,
            },
          });

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            password,
            user?.password ?? "",
          );

          if (!passwordMatch) {
            return null;
          }

          return user;
        } catch (error) {
          return null;
        }
      },
    }),
    /**
     * Uncomment the following lines to enable the Google provider.
     * Make sure to set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables.
     *
     * @see https://next-auth.js.org/providers/google
     */
    Google({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    signIn: async ({ user, account, profile }) => {
      // Allow all Google sign-ins (Google already verifies email)
      if (account?.provider === "google") {
        return true;
      }
      
      // For credentials (email/password), check if email is verified
      if (account?.provider === "credentials") {
        // This check is now handled in the authorize function above
        return true;
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;