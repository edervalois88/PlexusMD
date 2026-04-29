"use client";

import { useActionState } from "react";
import { Loader2, PlugZap, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import { testIntegrationConnection, updateOrganizationSettings, type SettingsActionState } from "./actions";

type SettingsFormProps = {
  organization: {
    id: string;
    name: string;
    slug: string;
    googleCalendarId: string;
    stripeAccountId: string;
    whatsappPhoneId: string;
    customMetadata: string;
    hasWhatsAppToken: boolean;
  };
};

const initialState: SettingsActionState = {};

function TestConnectionForm({ organizationId, service }: { organizationId: string; service: "google" | "whatsapp" }) {
  const [state, formAction, isPending] = useActionState(testIntegrationConnection, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="service" value={service} />
      <Button type="submit" variant="outline" className="h-10 rounded-xl" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <PlugZap />}
        Test {service === "google" ? "Google" : "WhatsApp"}
      </Button>
      {state.error ? <p className="text-xs font-medium text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-xs font-medium text-emerald-700">{state.success}</p> : null}
    </form>
  );
}

export function SettingsForm({ organization }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateOrganizationSettings, initialState);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <form action={formAction}>
        <input type="hidden" name="organizationId" value={organization.id} />

        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-xl font-black text-slate-950">{organization.name}</h2>
          <p className="text-sm text-slate-500">{organization.slug}.plexusmd.xyz</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Google Calendar ID</span>
            <input name="googleCalendarId" defaultValue={organization.googleCalendarId} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Stripe Account ID</span>
            <input name="stripeAccountId" defaultValue={organization.stripeAccountId} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">WhatsApp Phone ID</span>
            <input name="whatsappPhoneId" defaultValue={organization.whatsappPhoneId} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">WhatsApp Access Token</span>
            <input
              name="whatsappAccessToken"
              type="password"
              placeholder={organization.hasWhatsAppToken ? "Token cifrado guardado. Escribe uno nuevo para rotarlo." : "Pega el token de Meta"}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-1">
          <span className="text-sm font-semibold text-slate-700">custom_metadata JSON</span>
          <textarea
            name="customMetadata"
            defaultValue={organization.customMetadata}
            rows={4}
            className="w-full rounded-xl border border-slate-200 p-3 font-mono text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
        </label>

        {state.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{state.error}</p> : null}
        {state.success ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{state.success}</p> : null}

        <Button type="submit" className="mt-5 h-10 rounded-xl" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Guardar e invalidar cache
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-start gap-3">
        <TestConnectionForm organizationId={organization.id} service="google" />
        <TestConnectionForm organizationId={organization.id} service="whatsapp" />
      </div>
    </div>
  );
}
