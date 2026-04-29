import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { kv } from "@vercel/kv";

import { prisma } from "@/lib/prisma";

export type ValueMetric = {
  value: number;
  previousValue: number;
  percentChange: number;
};

export type MonthlyValueMetrics = {
  organizationId: string;
  monthLabel: string;
  preventedInteractions: ValueMetric;
  assistedConsultations: ValueMetric;
  savedMinutes: ValueMetric;
  chartData: Array<{
    name: string;
    interactions: number;
    consultations: number;
    minutes: number;
  }>;
};

const CACHE_TTL_SECONDS = 60 * 60 * 24;
const SIDE_DOCTOR_ACTION_PREFIX = "ai.side_doctor";

const getMonthWindow = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

const getPreviousMonthWindow = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const end = new Date(date.getFullYear(), date.getMonth(), 1);
  return { start, end };
};

const getPercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
};

const isRecord = (value: Prisma.JsonValue): value is Prisma.JsonObject => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};

const getPayloadNumber = (payload: Prisma.JsonValue, key: string) => {
  if (!isRecord(payload)) return 0;
  const value = payload[key];
  return typeof value === "number" ? value : 0;
};

const getRecommendationCategory = (payload: Prisma.JsonValue) => {
  if (!isRecord(payload)) return "";
  const category = payload.category;
  return typeof category === "string" ? category : "";
};

const getAiLogs = async (organizationId: string, start: Date, end: Date) => {
  return prisma.auditLog.findMany({
    where: {
      organizationId,
      action: {
        startsWith: SIDE_DOCTOR_ACTION_PREFIX,
      },
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    select: {
      action: true,
      payload: true,
      createdAt: true,
    },
  });
};

const calculatePreventedInteractions = (logs: Awaited<ReturnType<typeof getAiLogs>>) => {
  return logs.filter((log) => {
    const category = getRecommendationCategory(log.payload);
    const alertCount = getPayloadNumber(log.payload, "alertCount");
    return alertCount > 0 || category === "Alergia" || category === "Interaccion";
  }).length;
};

const calculateSavedMinutes = (logs: Awaited<ReturnType<typeof getAiLogs>>) => {
  return logs.reduce((total, log) => {
    if (log.action === "ai.side_doctor.consultation_streamed") return total + 8;
    if (log.action === "ai.side_doctor.insight_generated") return total + 6;
    if (log.action === "ai.side_doctor.medication_validated") return total + 3;
    return total + 2;
  }, 0);
};

const toValueMetric = (value: number, previousValue: number): ValueMetric => ({
  value,
  previousValue,
  percentChange: getPercentChange(value, previousValue),
});

const buildChartData = (logs: Awaited<ReturnType<typeof getAiLogs>>) => {
  const buckets = new Map<string, { interactions: number; consultations: number; minutes: number }>();

  for (const log of logs) {
    const key = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit" }).format(log.createdAt);
    const current = buckets.get(key) ?? { interactions: 0, consultations: 0, minutes: 0 };
    const category = getRecommendationCategory(log.payload);
    const alertCount = getPayloadNumber(log.payload, "alertCount");

    if (alertCount > 0 || category === "Alergia" || category === "Interaccion") {
      current.interactions += 1;
    }

    current.consultations += 1;
    current.minutes += calculateSavedMinutes([log]);
    buckets.set(key, current);
  }

  return Array.from(buckets.entries()).map(([name, values]) => ({ name, ...values }));
};

const getMonthlyValueMetricsFresh = async (organizationId: string): Promise<MonthlyValueMetrics> => {
  const currentWindow = getMonthWindow();
  const previousWindow = getPreviousMonthWindow();
  const [currentLogs, previousLogs] = await Promise.all([
    getAiLogs(organizationId, currentWindow.start, currentWindow.end),
    getAiLogs(organizationId, previousWindow.start, previousWindow.end),
  ]);

  const currentPreventedInteractions = calculatePreventedInteractions(currentLogs);
  const previousPreventedInteractions = calculatePreventedInteractions(previousLogs);
  const currentAssistedConsultations = currentLogs.length;
  const previousAssistedConsultations = previousLogs.length;
  const currentSavedMinutes = calculateSavedMinutes(currentLogs);
  const previousSavedMinutes = calculateSavedMinutes(previousLogs);

  return {
    organizationId,
    monthLabel: new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date()),
    preventedInteractions: toValueMetric(currentPreventedInteractions, previousPreventedInteractions),
    assistedConsultations: toValueMetric(currentAssistedConsultations, previousAssistedConsultations),
    savedMinutes: toValueMetric(currentSavedMinutes, previousSavedMinutes),
    chartData: buildChartData(currentLogs),
  };
};

export const getMonthlyValueMetrics = cache(async (organizationId: string) => {
  const cacheKey = `metrics:value:${organizationId}:${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

  try {
    const cached = await kv.get<MonthlyValueMetrics>(cacheKey);
    if (cached) return cached;
  } catch {
    // KV is an optimization. Database aggregation remains the source of truth.
  }

  const metrics = await getMonthlyValueMetricsFresh(organizationId);

  try {
    await kv.set(cacheKey, metrics, { ex: CACHE_TTL_SECONDS });
  } catch {
    // Ignore cache write failures in local/dev and degraded KV states.
  }

  return metrics;
});

export const getPreventedInteractions = async (organizationId: string) => {
  return (await getMonthlyValueMetrics(organizationId)).preventedInteractions;
};

export const getAssistedConsultations = async (organizationId: string) => {
  return (await getMonthlyValueMetrics(organizationId)).assistedConsultations;
};

export const getTASavedTime = async (organizationId: string) => {
  return (await getMonthlyValueMetrics(organizationId)).savedMinutes;
};
