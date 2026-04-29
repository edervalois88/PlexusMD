"use client";

import { useActionState } from "react";
import { Building2, Loader2, Mail, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { registerTenant, type RegisterTenantState } from "./actions";

const initialState: RegisterTenantState = {};

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerTenant, initialState);

  return (
    <Card className="border-white/70 bg-white/85 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-2xl font-black text-slate-950">Registra tu clinica</CardTitle>
        <CardDescription>
          Crea un tenant activo y entra directo al dashboard en tu subdominio.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form action={formAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Stethoscope size={16} />
              Nombre del medico
            </span>
            <input
              name="doctorName"
              required
              minLength={2}
              placeholder="Dra. Ana Martinez"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Mail size={16} />
              Email
            </span>
            <input
              name="email"
              required
              type="email"
              placeholder="ana@clinica.mx"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building2 size={16} />
              Nombre de la clinica
            </span>
            <input
              name="clinicName"
              required
              minLength={2}
              placeholder="Clinica Norte"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Slug deseado</span>
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-100">
              <input
                name="slug"
                required
                minLength={3}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="clinica-norte"
                className="h-12 min-w-0 flex-1 px-4 text-slate-900 outline-none"
              />
              <span className="hidden items-center border-l border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 sm:flex">
                .plexusmd.xyz
              </span>
            </div>
          </label>

          {state.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {state.error}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Creando tenant...
              </>
            ) : (
              "Crear clinica y abrir dashboard"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
