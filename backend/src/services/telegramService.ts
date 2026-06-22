import { Telegraf } from "telegraf";
import logger from "../config/logger";

let bot: Telegraf | null = null;

export const initTelegramBot = (): Telegraf | null => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled");
    return null;
  }

  bot = new Telegraf(token);

  bot.command("start", (ctx) => {
    const chatId = ctx.chat.id.toString();
    ctx.reply(
      `Welcome to Smart Task Assistant!\n\nYour chat ID is: ${chatId}\n\nAdd this ID in your notification settings to receive alerts.`
    );
  });

  bot.command("status", (ctx) => {
    ctx.reply("Smart Task Assistant bot is running and ready to send notifications.");
  });

  bot.launch().catch((err) => {
    logger.error({ message: "Telegram bot launch failed", error: err });
  });

  process.once("SIGINT", () => bot?.stop("SIGINT"));
  process.once("SIGTERM", () => bot?.stop("SIGTERM"));

  logger.info("Telegram bot initialized");
  return bot;
};

export const sendTelegramMessage = async (chatId: string, message: string): Promise<void> => {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("Telegram bot not configured");
    bot = new Telegraf(token);
  }

  await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  logger.info({ message: "Telegram message sent", chatId });
};

export const sendTelegramNotification = async (
  chatId: string,
  title: string,
  body: string
): Promise<void> => {
  const message = `*${title}*\n\n${body}\n\n— Smart Task Assistant`;
  await sendTelegramMessage(chatId, message);
};
