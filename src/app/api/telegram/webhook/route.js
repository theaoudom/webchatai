import { NextResponse } from "next/server";
import { COMMANDS, isValidCommand, generateAIResponse } from "../../../../service/aiCommands";
import { sendMessage, sendChatAction } from "../../../../service/telegram";
import { checkRateLimit } from "../../../../utils/rateLimiter";

const SECRET_TOKEN = process.env.TELEGRAM_WEBHOOK_SECRET;

const HELP_TEXT =
  "*Dom-AI* — AI directly in your chats.\n\n" +
  "Reply to any message, then send one of:\n" +
  "/ask — general AI answer\n" +
  "/fix — fix grammar & improve writing\n" +
  "/explain — explain code or text simply\n" +
  "/summarize — summarize the content\n" +
  "/translate — translate to English\n\n" +
  "You can also type the text inline, e.g. `/ask How do I fix this Kotlin crash?`";

const NO_REPLY_MSG = "Please reply to a message first (or type your text after the command).";
const AI_DOWN_MSG = "AI is temporarily unavailable.\nPlease try again later.";

// POST handler for the Telegram webhook.
// Always returns 200 so Telegram does not retry; user-facing problems are sent
// back into the chat instead.
export async function POST(req) {
  // Verify the request really came from Telegram (set via setWebhook secret_token).
  if (SECRET_TOKEN) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== SECRET_TOKEN) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // We only handle plain messages (ignore edited messages, callbacks, etc.).
  const message = update?.message;
  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  try {
    await handleMessage(message);
  } catch (err) {
    console.error("Telegram webhook handler error:", err);
    try {
      await sendMessage(message.chat.id, AI_DOWN_MSG, { replyTo: message.message_id });
    } catch {
      /* swallow — nothing more we can do */
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const userId = message.from?.id ?? chatId;

  const parsed = parseCommand(message.text);
  if (!parsed) return; // not a command — stay silent (also correct for groups)

  const { command, inlineText } = parsed;

  if (command === "start" || command === "help") {
    await sendMessage(chatId, HELP_TEXT, { replyTo: message.message_id });
    return;
  }

  if (!isValidCommand(command)) {
    await sendMessage(
      chatId,
      `Unknown command. Try:\n${Object.keys(COMMANDS).map((c) => `/${c}`).join("  ")}`,
      { replyTo: message.message_id }
    );
    return;
  }

  // Prefer the replied-to message; fall back to inline text after the command.
  const repliedText = message.reply_to_message?.text || message.reply_to_message?.caption;
  const input = (repliedText || inlineText || "").trim();

  if (!input) {
    await sendMessage(chatId, NO_REPLY_MSG, { replyTo: message.message_id });
    return;
  }

  // Anti-spam.
  const limit = checkRateLimit(userId);
  if (!limit.allowed) {
    const wait = limit.retryAfter ? ` (try again in ${limit.retryAfter}s)` : "";
    await sendMessage(chatId, `You're going too fast.${wait}`, { replyTo: message.message_id });
    return;
  }

  // Typing indicator while we wait on Gemini.
  await sendChatAction(chatId, "typing");

  let response;
  try {
    response = await generateAIResponse(command, input);
  } catch (err) {
    console.error(`generateAIResponse(${command}) failed:`, err.message);
    await sendMessage(chatId, AI_DOWN_MSG, { replyTo: message.message_id });
    return;
  }

  await sendMessage(chatId, response, { replyTo: message.message_id });
}

/**
 * Parse a message into a command and any inline text.
 * Handles group-style commands like "/ask@DomAiBot".
 * Returns null when the text is not a command.
 */
function parseCommand(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) return null;

  const spaceIdx = trimmed.search(/\s/);
  const rawCommand = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const inlineText = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

  // Strip leading "/" and any "@BotName" suffix.
  const command = rawCommand.slice(1).split("@")[0].toLowerCase();

  return { command, inlineText };
}
