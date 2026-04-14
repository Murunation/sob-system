import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function findUsersByRoles(roles: Role[]) {
  return prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true, role: true },
  })
}
