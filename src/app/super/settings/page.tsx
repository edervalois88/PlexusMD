import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Super Settings",
};

export default async function SuperSettingsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/");
  }

  const organizations = await prisma.organization.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      settings: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 text-[#1E293B]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Super-Admin</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Configuracion dinamica de tenants</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Actualiza integraciones por clinica sin reiniciar el servidor. Los cambios invalidan KV para que Calendar,
            WhatsApp y Stripe usen la configuracion nueva.
          </p>
        </div>

        <div className="space-y-5">
          {organizations.map((organization) => (
            <SettingsForm
              key={organization.id}
              organization={{
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                googleCalendarId: organization.settings?.google_calendar_id ?? "",
                stripeAccountId: organization.settings?.stripe_account_id ?? organization.stripe_connect_id ?? "",
                whatsappPhoneId: organization.settings?.whatsapp_phone_id ?? "",
                customMetadata: JSON.stringify(organization.settings?.custom_metadata ?? {}, null, 2),
                hasWhatsAppToken: Boolean(organization.settings?.whatsapp_access_token),
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
