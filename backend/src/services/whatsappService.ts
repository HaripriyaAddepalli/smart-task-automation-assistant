import twilio from "twilio";
import logger from "../config/logger";

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials not configured");
  }

  return { client: twilio(accountSid, authToken), fromNumber };
};

export const sendWhatsAppMessage = async (toNumber: string, message: string): Promise<string> => {
  const { client, fromNumber } = getTwilioClient();

  const formattedTo = toNumber.startsWith("whatsapp:") ? toNumber : `whatsapp:${toNumber}`;
  const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

  const result = await client.messages.create({
    body: message,
    from: formattedFrom,
    to: formattedTo,
  });

  logger.info({ message: "WhatsApp message sent", sid: result.sid, to: formattedTo });
  return result.sid;
};

export const sendWhatsAppNotification = async (
  phoneNumber: string,
  title: string,
  body: string
): Promise<string> => {
  const message = `*${title}*\n\n${body}\n\n— Smart Task Assistant`;
  return sendWhatsAppMessage(phoneNumber, message);
};
