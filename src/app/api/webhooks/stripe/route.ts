import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
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
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Recuperamos el ID de la cita que pasamos en metadata al crear el Checkout
    const appointmentId = session.metadata?.appointmentId;

    if (appointmentId) {
      try {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { payment_status: "PAID" },
        });
        console.log(`Appointment ${appointmentId} marked as PAID`);
      } catch (error) {
        console.error("Error updating appointment payment status:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
