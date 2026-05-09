import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is required to initialize Prisma.');
}

const pool = new Pool({
  connectionString,
  max: Number(process.env.POSTGRES_POOL_MAX ?? 5),
  idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT_MS ?? 10_000),
  connectionTimeoutMillis: Number(process.env.POSTGRES_CONNECTION_TIMEOUT_MS ?? 5_000),
  allowExitOnIdle: true,
});
const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({
  adapter,
  log: ['query'],
});

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);

        const mutationOperations = ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'];
        
        if (mutationOperations.includes(operation) && model !== 'AuditLog') {
          // Log the mutation
          await (basePrisma as any).auditLog.create({
            data: {
              action: `${model}.${operation}`,
              resource: model,
              payload: args as any,
              // userId: To be added from context later if possible
            }
          }).catch(err => console.error("Audit log failed", err));
        }
        
        return result;
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as any;
