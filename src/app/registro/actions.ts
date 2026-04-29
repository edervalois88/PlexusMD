"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export type RegisterTenantState = {
  error?: string;
};

const registerTenantSchema = z.object({
  doctorName: z.string().trim().min(2, "Ingresa el nombre del medico."),
  email: z.string().trim().email("Ingresa un email valido.").toLowerCase(),
  clinicName: z.string().trim().min(2, "Ingresa el nombre de la clinica."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .max(40, "El slug no puede exceder 40 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minusculas, numeros y guiones intermedios."),
});

const getTenantDashboardUrl = (slug: string) => {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN ?? "plexusmd.xyz";
  return `https://${slug}.${rootDomain}/dashboard`;
};

export async function registerTenant(
  _prevState: RegisterTenantState,
  formData: FormData,
): Promise<RegisterTenantState> {
  const parsed = registerTenantSchema.safeParse({
    doctorName: formData.get("doctorName"),
    email: formData.get("email"),
    clinicName: formData.get("clinicName"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos del registro.",
    };
  }

  const { doctorName, email, clinicName, slug } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: clinicName,
          slug,
          is_active: true,
          settings_json: {
            onboarding: {
              doctorName,
              source: "registro-publico",
            },
          },
        },
      });

      await tx.user.create({
        data: {
          email,
          role: "DOCTOR",
          organization_id: organization.id,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        error: "Ese slug o email ya esta registrado. Prueba con otro.",
      };
    }

    console.error("Tenant registration failed", error);
    return {
      error: "No pudimos crear la clinica. Intenta de nuevo.",
    };
  }

  redirect(getTenantDashboardUrl(slug));
}
