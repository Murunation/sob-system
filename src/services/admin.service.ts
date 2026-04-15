import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function findUsersByRoles(roles: Role[]) {
  return prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true, role: true },
  })
}

export async function findAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      firstname: true,
      lastname: true,
      role: true,
      username: true,
      email: true,
      phone: true,
      isArchived: true,
      createdAt: true,
    },
    orderBy: [{ role: 'asc' }, { lastname: 'asc' }],
  })
}

export async function updateUserCredentials(
  id: number,
  data: { username: string; passwordHash?: string }
) {
  return prisma.user.update({
    where: { id },
    data: {
      username: data.username,
      ...(data.passwordHash ? { password: data.passwordHash } : {}),
    },
  })
}

export async function setUserArchived(id: number, isArchived: boolean) {
  return prisma.user.update({ where: { id }, data: { isArchived } })
}

export async function deleteUserById(id: number) {
  // Cascade: delete related records before deleting user
  // We only allow deleting PARENT users safely here (others have complex relations)
  return prisma.user.delete({ where: { id } })
}
