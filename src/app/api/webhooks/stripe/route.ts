import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const resolveAppointmentId = async (stripe: Stripe, session: Stripe.Checkout.Session) => {
  if (session.metadata?.appointmentId) {
    return session.metadata.appointmentId;
  }

  const paymentLinkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;

  if (!paymentLinkId) {
    return null;
  }

  const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
  return paymentLink.metadata?.appointmentId ?? null;
};

export async function POST(req: Request) {
  // Inicializar Stripe solo en tiempo de ejecución
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-04-22.dahlia",
  });

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = await resolveAppointmentId(stripe, session);

    if (appointmentId) {
      try {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            payment_status: "PAID",
            reservation_expires_at: null,
          },
        });
        console.log(`Appointment ${appointmentId} marked as PAID`);
      } catch (error) {
        console.error("Error updating appointment payment status:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
