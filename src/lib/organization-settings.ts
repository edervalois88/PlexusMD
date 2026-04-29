import { kv } from "@vercel/kv";

import { decryptSecret } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

export type DynamicOrganizationSettings = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  googleCalendarId: string | null;
  stripeAccountId: string | null;
  whatsappAccessToken: string | null;
  whatsappPhoneId: string | null;
  customMetadata: Record<string, unknown>;
};

const settingsCacheKey = (organizationId: string) => `organization:${organizationId}:settings`;

export const invalidateOrganizationSettingsCache = async (organizationId: string, slug?: string | null) => {
  await Promise.allSettled([
    kv.del(settingsCacheKey(organizationId)),
    slug ? kv.del(`tenant:${slug}:status`) : Promise.resolve(),
    kv.del("tenant:default-active"),
  ]);
};

export const getOrganizationSettings = async (organizationId: string): Promise<DynamicOrganizationSettings | null> => {
  const cached = await kv.get<DynamicOrganizationSettings>(settingsCacheKey(organizationId)).catch(() => null);

  if (cached) {
    return cached;
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      settings: true,
    },
  });

  if (!organization) {
    return null;
  }

  const settings: DynamicOrganizationSettings = {
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    googleCalendarId: organization.settings?.google_calendar_id ?? null,
    stripeAccountId: organization.settings?.stripe_account_id ?? organization.stripe_connect_id ?? null,
    whatsappAccessToken: decryptSecret(organization.settings?.whatsapp_access_token),
    whatsappPhoneId: organization.settings?.whatsapp_phone_id ?? null,
    customMetadata: (organization.settings?.custom_metadata as Record<string, unknown> | null) ?? {},
  };

  await kv.set(settingsCacheKey(organizationId), settings, { ex: 60 }).catch(() => undefined);

  return settings;
};

export const getOrganizationSettingsByWhatsAppPhoneId = async (phoneId: string) => {
  const organization = await prisma.organization.findFirst({
    where: {
      settings: {
        whatsapp_phone_id: phoneId,
      },
      is_active: true,
    },
    include: {
      settings: true,
    },
  });

  if (!organization) {
    return null;
  }

  return await getOrganizationSettings(organization.id);
};
