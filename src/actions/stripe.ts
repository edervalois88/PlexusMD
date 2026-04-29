"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function createStripeConnectLink(organizationId: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) throw new Error("Organization not found");

    let accountId = organization.stripe_connect_id;

    if (!accountId) {
      // Create a Standard Stripe Connect Account
      const account = await stripe.accounts.create({
        type: "standard",
      });
      accountId = account.id;

      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripe_connect_id: accountId },
      });
    }

    // Generate Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/configuracion`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (error: unknown) {
    console.error("Error creating Stripe Connect Link:", error);
    throw new Error(error instanceof Error ? error.message : "Error creating Stripe Connect Link");
  }
}

export async function createCheckoutSession(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        organization: true,
        patient: true,
      },
    });

    if (!appointment) throw new Error("Appointment not found");
    if (!appointment.organization.stripe_connect_id) {
      throw new Error("Organization is not connected to Stripe");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Cita Médica - ${appointment.patient.full_name}`,
              description: `Cita para el día ${appointment.start_time.toLocaleDateString()}`,
            },
            unit_amount: 50000, // 500 MXN in cents (ejemplo estático)
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: 5000, // 50 MXN fee (10% platform fee)
        transfer_data: {
          destination: appointment.organization.stripe_connect_id,
        },
      },
      metadata: {
        appointmentId: appointment.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${appointment.organization.slug}/agenda?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${appointment.organization.slug}/agenda?canceled=true`,
    });

    return { url: session.url };
  } catch (error: unknown) {
    console.error("Error creating Checkout Session:", error);
    throw new Error(error instanceof Error ? error.message : "Error creating Checkout Session");
  }
}
