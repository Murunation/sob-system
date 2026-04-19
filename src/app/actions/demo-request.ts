"use server";

import { prisma } from "@/lib/prisma";

export async function saveDemoRequest(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  students: string;
  locations: string;
  started: string;
}) {
  await prisma.demoRequest.create({ data });
}

export async function getDemoRequests() {
  return prisma.demoRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}
