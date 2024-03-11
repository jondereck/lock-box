import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";

import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";



export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",

  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Check if user is undefined
      if (!user) return false;
      
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;
    
      // Ensure that user.id is defined before passing it to getUserById
      const userId = user.id || ''; // Provide a default value if id is undefined
      
      const existingUser = await getUserById(userId);
    
      if (!existingUser?.emailVerified) return false;
    
      return true;
    },
    
    // async signIn({ user }: { user: any }){
    //   const existingUser = await getUserById(user.id);

    //   if (!existingUser || !existingUser.emailVerified) {
    //     return false;
    //   }
    //   return true;
    // },

    async session({ token, session }) {
      console.log({
        sessionToken: token,
      })
      if (token.sub && session.user) {
        session.user.id = token.sub
      }


      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;
      token.role = existingUser.role

      console.log({ token })
      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})