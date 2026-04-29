import { google } from "googleapis";

import { getOrganizationSettings } from "@/lib/organization-settings";

export type CalendarSlot = {
  start: string;
  end: string;
  label: string;
};

const SLOT_MINUTES = 30;

const getCalendarAuth = () => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
  }

  return new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
};

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

const overlapsBusyWindow = (slotStart: Date, slotEnd: Date, busyWindows: Array<{ start?: string | null; end?: string | null }>) =>
  busyWindows.some((busy) => {
    if (!busy.start || !busy.end) return false;

    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);

    return slotStart < busyEnd && slotEnd > busyStart;
  });

export class GoogleCalendarService {
  private calendarId: string;

  constructor(calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary") {
    this.calendarId = calendarId;
  }

  static async forOrganization(organizationId: string) {
    const settings = await getOrganizationSettings(organizationId);
    return new GoogleCalendarService(settings?.googleCalendarId ?? process.env.GOOGLE_CALENDAR_ID ?? "primary");
  }

  async checkAvailability(date: Date): Promise<CalendarSlot[]> {
    const auth = getCalendarAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const timeMin = new Date(date);
    timeMin.setHours(Number(process.env.CALENDAR_WORKDAY_START_HOUR ?? 9), 0, 0, 0);

    const timeMax = new Date(date);
    timeMax.setHours(Number(process.env.CALENDAR_WORKDAY_END_HOUR ?? 17), 0, 0, 0);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: process.env.CALENDAR_TIME_ZONE ?? "America/Mexico_City",
        items: [{ id: this.calendarId }],
      },
    });

    const busyWindows = response.data.calendars?.[this.calendarId]?.busy ?? [];
    const slots: CalendarSlot[] = [];

    for (let slotStart = new Date(timeMin); slotStart < timeMax; slotStart = addMinutes(slotStart, SLOT_MINUTES)) {
      const slotEnd = addMinutes(slotStart, SLOT_MINUTES);

      if (slotEnd > timeMax || overlapsBusyWindow(slotStart, slotEnd, busyWindows)) {
        continue;
      }

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        label: slotStart.toLocaleString("es-MX", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: process.env.CALENDAR_TIME_ZONE ?? "America/Mexico_City",
        }),
      });
    }

    return slots;
  }

  async isSlotAvailable(startTime: Date, endTime: Date) {
    const slots = await this.checkAvailability(startTime);
    return slots.some((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      return slotStart <= startTime && slotEnd >= endTime;
    });
  }

  async createEvent(input: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail?: string | null;
  }) {
    const auth = getCalendarAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: {
          dateTime: input.startTime.toISOString(),
          timeZone: process.env.CALENDAR_TIME_ZONE ?? "America/Mexico_City",
        },
        end: {
          dateTime: input.endTime.toISOString(),
          timeZone: process.env.CALENDAR_TIME_ZONE ?? "America/Mexico_City",
        },
        attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : undefined,
      },
    });

    return {
      id: response.data.id ?? null,
      htmlLink: response.data.htmlLink ?? null,
    };
  }
}
