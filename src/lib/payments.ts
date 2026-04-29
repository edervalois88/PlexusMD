import { stripe } from "@/lib/stripe";

export const createAppointmentPaymentLink = async ({
  organizationId,
  patientPhone,
  slotStart,
  stripeAccountId,
}: {
  organizationId: string;
  patientPhone: string;
  slotStart: string;
  stripeAccountId?: string | null;
}) => {
  const price = await stripe.prices.create({
    currency: "mxn",
    unit_amount: Number(process.env.APPOINTMENT_PRICE_CENTS ?? 50000),
    product_data: {
      name: `Reserva de cita medica - ${new Date(slotStart).toLocaleString("es-MX")}`,
    },
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      organizationId,
      patientPhone,
      slotStart,
      source: "whatsapp-bot",
    },
    ...(stripeAccountId
      ? {
          application_fee_amount: Number(process.env.APPOINTMENT_PLATFORM_FEE_CENTS ?? 5000),
          transfer_data: {
            destination: stripeAccountId,
          },
        }
      : {}),
  });

  return paymentLink.url;
};
