import { NextResponse } from "next/server";

import { GoogleCalendarService } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

const isAuthorizedCronRequest = (request: Request) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");

  return authorization === `Bearer ${cronSecret}` || headerSecret === cronSecret;
};

const handleReservationExpiration = async (request: Request) => {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expiredAppointments = await prisma.appointment.findMany({
    where: {
      status: "SCHEDULED",
      payment_status: "PENDING",
      reservation_expires_at: {
        lte: now,
      },
    },
    select: {
      id: true,
      organization_id: true,
      google_event_id: true,
    },
    take: 100,
  });

  for (const appointment of expiredAppointments) {
    if (appointment.google_event_id) {
      const calendar = await GoogleCalendarService.forOrganization(appointment.organization_id);
      await calendar.deleteEvent(appointment.google_event_id).catch((error) => {
        console.warn("Expired WhatsApp reservation calendar cleanup failed.", {
          appointmentId: appointment.id,
          error,
        });
      });
    }

    await prisma.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        status: "CANCELLED",
        cancellation_reason: "whatsapp_reservation_expired",
      },
    });
  }

  if (expiredAppointments.length > 0) {
    await prisma.auditLog.create({
      data: {
        action: "whatsapp.reservations_expired",
        resource: "Appointment",
        payload: {
          count: expiredAppointments.length,
          appointmentIds: expiredAppointments.map((appointment) => appointment.id),
        },
      },
    }).catch((error) => console.warn("Reservation expiration audit failed.", error));
  }

  return NextResponse.json({
    expired: expiredAppointments.length,
  });
};

export async function GET(request: Request) {
  return await handleReservationExpiration(request);
}

export async function POST(request: Request) {
  return await handleReservationExpiration(request);
}
