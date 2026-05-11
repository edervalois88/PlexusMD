import { PrismaClient } from '@prisma/client';
import { basePrisma } from './prisma-instance';
import { getCurrentUserId } from './session-info';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);

        const mutationOperations = ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'];
        
        if (mutationOperations.includes(operation) && model !== 'AuditLog') {
          // Log the mutation automatically
          // We try to get the userId from the session if we are in a server context
          const userId = await getCurrentUserId();
          
          const payload = args as Record<string, unknown>;
          const data = payload?.data as Record<string, unknown> | undefined;
          const where = payload?.where as Record<string, unknown> | undefined;
          const organizationId = (data?.organization_id || where?.organization_id || null) as string | null;

          await basePrisma.auditLog.create({
            data: {
              action: `${model}.${operation}`,
              resource: model,
              payload: payload as import("@prisma/client").Prisma.InputJsonValue,
              userId: userId,
              organizationId: organizationId,
            }
          }).catch((err: unknown) => console.error("Automatic Audit log failed", err));
        }
        
        return result;
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as unknown as PrismaClient;
