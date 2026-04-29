const WHATSAPP_API_VERSION = "v24.0";

export const sendWhatsAppMessage = async (
  to: string,
  body: string,
  options?: {
    phoneNumberId?: string | null;
    accessToken?: string | null;
  },
) => {
  const phoneNumberId = options?.phoneNumberId ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = options?.accessToken ?? process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("WhatsApp credentials are not configured. Message not sent.", { to, body });
    return;
  }

  const response = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        preview_url: true,
        body,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${errorBody}`);
  }
};
