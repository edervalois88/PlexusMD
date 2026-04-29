import { headers } from "next/headers";
import { after } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type AuditLogInput = {
  userId?: string | null;
  organizationId?: string | null;
  action: string;
  resource: string;
  payload?: Prisma.InputJsonValue;
  ip?: string | null;
};

const getRequestIp = async () => {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    null
  );
};

export async function createAuditLog(data: AuditLogInput) {
  const [session, ip] = await Promise.all([
    getServerSession(authOptions).catch(() => null),
    data.ip === undefined ? getRequestIp().catch(() => null) : Promise.resolve(data.ip),
  ]);

  const userId = data.userId ?? session?.user?.id ?? null;
  const organizationId = data.organizationId ?? session?.user?.organizationId ?? null;

  after(async () => {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          organizationId,
          action: data.action,
          resource: data.resource,
          payload: data.payload ?? {},
          ip,
        },
      });
    } catch (error) {
      console.warn("Audit log write failed.", error);
    }
  });
}

export async function deleteAuditLogsOlderThan(days = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });
}
