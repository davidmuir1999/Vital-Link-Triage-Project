import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/src/lib/db"
import { compare } from "bcryptjs"
import { type NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // 1. Configure the Login Provider
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // A. Check if inputs exist
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // B. Look up user in Database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // C. Check Password (bcrypt)
        // This compares the typed password 'password123' with the hash in the DB
        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // D. Return the user object (This gets saved to the session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // We will need to pass this custom field
        }
      }
    })
  ],
  // 2. Configure Session (Use JSON Web Tokens)
  session: {
    strategy: "jwt"
  },
  // 3. Custom Pages (Optional - we will link your login page later)
  pages: {
    signIn: '/login',
  },
  // 4. Callbacks (To make sure the Role is available in the app)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }