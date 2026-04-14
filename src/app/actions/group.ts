'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import {
  findGroups,
  createGroup as dbCreateGroup,
  updateGroup as dbUpdateGroup,
  archiveGroup as dbArchiveGroup,
} from '@/services/group.service'

export const getGroups = unstable_cache(
  () => findGroups(),
  ['groups'],
  { tags: ['groups'], revalidate: 300 }
)

export async function createGroup(data: {
  name: string
  ageRange: string
  capacity: number
  teacherId?: number
}) {
  await dbCreateGroup(data)
  revalidateTag('groups')
  revalidatePath('/admin/groups')
}

export async function updateGroup(id: number, data: {
  name: string
  ageRange: string
  capacity: number
  teacherId?: number
}) {
  await dbUpdateGroup(id, data)
  revalidateTag('groups')
  revalidatePath('/admin/groups')
}

export async function archiveGroup(id: number) {
  await dbArchiveGroup(id)
  revalidateTag('groups')
  revalidatePath('/admin/groups')
}
