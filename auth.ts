import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDb from "./lib/db";
import User from "./models/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // trustHost: true, //  Required for production (Vercel, Railway, etc.)

  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      async authorize(credentials) {
        try {
          const email = (credentials?.email as string)?.toLowerCase()?.trim();
          const password = credentials?.password as string;

          if (!email || !password) return null;

          await connectDb();

          const user = await User.findOne({ email }).select(
            "+password +role +name +email",
          );

          //  Guard: user not found or has no password (e.g. Google-only account)
          if (!user || !user.password) return null;

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const email = user.email?.toLowerCase()?.trim();
          if (!email) return false;

          await connectDb();

          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email,
              image: user.image,
              role: "user",
            });
          }

          //  Attach DB id and role onto the user object for jwt callback
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
        }

        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);
        return false;
      }
    },

    async jwt({ token, user, trigger }) {
      //  On initial sign-in, user object is available — persist to token
      if (user) {
        token.id = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.role = user.role ?? "user";
      }

      //  Fallback ONLY if id is still missing (edge case: token without id)
      // Guarded by trigger to avoid hitting DB on every request
      if (!token.id && token.email && trigger === "signIn") {
        try {
          await connectDb();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("JWT fallback DB lookup error:", error);
        }
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
  },

  secret: process.env.AUTH_SECRET,
});
