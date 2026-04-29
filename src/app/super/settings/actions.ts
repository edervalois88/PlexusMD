"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { encryptSecret } from "@/lib/encryption";
import { createAuditLog } from "@/lib/audit";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { getOrganizationSettings, invalidateOrganizationSettingsCache } from "@/lib/organization-settings";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

export type SettingsActionState = {
  error?: string;
  success?: string;
};

const settingsSchema = z.object({
  organizationId: z.string().uuid(),
  googleCalendarId: z.string().trim().optional(),
  stripeAccountId: z.string().trim().optional(),
  whatsappAccessToken: z.string().trim().optional(),
  whatsappPhoneId: z.string().trim().optional(),
  customMetadata: z.string().trim().optional(),
});

const parseMetadata = (rawMetadata?: string) => {
  if (!rawMetadata) return {};

  try {
    return JSON.parse(rawMetadata) as Record<string, unknown>;
  } catch {
    throw new Error("custom_metadata debe ser JSON valido.");
  }
};

const optionalString = (value?: string) => (value ? value : null);

export async function updateOrganizationSettings(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  try {
    await requireSuperAdmin();

    const parsed = settingsSchema.safeParse({
      organizationId: formData.get("organizationId"),
      googleCalendarId: formData.get("googleCalendarId"),
      stripeAccountId: formData.get("stripeAccountId"),
      whatsappAccessToken: formData.get("whatsappAccessToken"),
      whatsappPhoneId: formData.get("whatsappPhoneId"),
      customMetadata: formData.get("customMetadata"),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Revisa la configuracion.",
      };
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: parsed.data.organizationId,
      },
    });

    if (!organization) {
      return {
        error: "Organizacion no encontrada.",
      };
    }

    const metadata = parseMetadata(parsed.data.customMetadata) as Prisma.InputJsonValue;
    const encryptedWhatsAppToken = parsed.data.whatsappAccessToken
      ? encryptSecret(parsed.data.whatsappAccessToken)
      : undefined;

    await prisma.organizationSettings.upsert({
      where: {
        organization_id: organization.id,
      },
      create: {
        organization_id: organization.id,
        google_calendar_id: optionalString(parsed.data.googleCalendarId),
        stripe_account_id: optionalString(parsed.data.stripeAccountId),
        whatsapp_access_token: encryptedWhatsAppToken ?? null,
        whatsapp_phone_id: optionalString(parsed.data.whatsappPhoneId),
        custom_metadata: metadata,
      },
      update: {
        google_calendar_id: optionalString(parsed.data.googleCalendarId),
        stripe_account_id: optionalString(parsed.data.stripeAccountId),
        ...(encryptedWhatsAppToken
          ? {
              whatsapp_access_token: encryptedWhatsAppToken,
            }
          : {}),
        whatsapp_phone_id: optionalString(parsed.data.whatsappPhoneId),
        custom_metadata: metadata,
      },
    });

    await prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        stripe_connect_id: optionalString(parsed.data.stripeAccountId),
      },
    });

    await invalidateOrganizationSettingsCache(organization.id, organization.slug);
    await createAuditLog({
      organizationId: organization.id,
      action: "organization_settings.updated",
      resource: "OrganizationSettings",
      payload: {
        organizationId: organization.id,
        organizationSlug: organization.slug,
        changedFields: [
          "google_calendar_id",
          "stripe_account_id",
          "whatsapp_phone_id",
          "custom_metadata",
          ...(encryptedWhatsAppToken ? ["whatsapp_access_token"] : []),
        ],
      },
    });
    revalidatePath("/super/settings");

    return {
      success: `Configuracion actualizada para ${organization.name}.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo actualizar la configuracion.",
    };
  }
}

export async function testIntegrationConnection(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  try {
    await requireSuperAdmin();

    const organizationId = z.string().uuid().parse(formData.get("organizationId"));
    const service = z.enum(["google", "whatsapp"]).parse(formData.get("service"));
    const settings = await getOrganizationSettings(organizationId);

    if (!settings) {
      return {
        error: "Organizacion no encontrada.",
      };
    }

    if (service === "google") {
      if (!settings.googleCalendarId) {
        return {
          error: "Falta google_calendar_id.",
        };
      }

      const calendar = await GoogleCalendarService.forOrganization(organizationId);
      await calendar.checkAvailability(new Date());

      return {
        success: "Google Calendar respondio correctamente.",
      };
    }

    if (!settings.whatsappPhoneId || !settings.whatsappAccessToken) {
      return {
        error: "Faltan whatsapp_phone_id o whatsapp_access_token.",
      };
    }

    const response = await fetch(`https://graph.facebook.com/v24.0/${settings.whatsappPhoneId}?fields=id,display_phone_number,verified_name`, {
      headers: {
        Authorization: `Bearer ${settings.whatsappAccessToken}`,
      },
    });

    if (!response.ok) {
      return {
        error: `WhatsApp API rechazo credenciales (${response.status}).`,
      };
    }

    return {
      success: "WhatsApp API respondio correctamente.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo probar la conexion.",
    };
  }
}
