import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Нэвтрэх нэр', type: 'text' },
        password: { label: 'Нууц үг', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user || user.isArchived) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: String(user.id),
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          role: user.role,
          profileCompleted: user.profileCompleted,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.profileCompleted = (user as any).profileCompleted ?? true
      }
      // Профайл дүүргэсний дараа update() дуудахад DB-ээс шинэчилнэ
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          select: { profileCompleted: true },
        })
        if (dbUser) token.profileCompleted = dbUser.profileCompleted
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
        ;(session.user as any).profileCompleted = token.profileCompleted
      }
      return session
    },
  },
}
