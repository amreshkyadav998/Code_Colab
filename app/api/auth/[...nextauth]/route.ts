import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    GithubProvider({
      // github 
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase()

        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.sub as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        await connectToDatabase()

        // Check if user exists
        const existingUser = await User.findOne({ email: user.email })

        if (!existingUser) {
          // Create new user
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "github",
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
