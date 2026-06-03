// Thin wrapper around the Telegram Bot API used by the webhook route.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

// Telegram messages cap at 4096 chars. Leave a little headroom.
export const MAX_MESSAGE_LENGTH = 4000;

async function callTelegram(method, payload) {
  if (!API_BASE) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const reason = data.description || `HTTP ${res.status}`;
    throw new Error(`Telegram ${method} failed: ${reason}`);
  }
  return data.result;
}

/**
 * Show the "typing..." indicator in a chat. Fire-and-forget; never throws.
 */
export async function sendChatAction(chatId, action = "typing") {
  try {
    await callTelegram("sendChatAction", { chat_id: chatId, action });
  } catch (err) {
    console.error("sendChatAction failed:", err.message);
  }
}

/**
 * Send a text message, replying to a specific message when provided.
 *
 * Gemini returns standard Markdown. Telegram's legacy "Markdown" parse mode is
 * the most forgiving option for that, but malformed markup makes the API reject
 * the whole message — so if a parsed send fails we retry once as plain text.
 */
export async function sendMessage(chatId, text, { replyTo, parseMode = "Markdown", replyMarkup } = {}) {
  const chunks = splitMessage(text);

  for (let i = 0; i < chunks.length; i++) {
    const payload = {
      chat_id: chatId,
      text: chunks[i],
      // Only the first chunk replies to the original message / gets the keyboard.
      ...(i === 0 && replyTo ? { reply_to_message_id: replyTo } : {}),
      ...(i === 0 && replyMarkup ? { reply_markup: replyMarkup } : {}),
      ...(parseMode ? { parse_mode: parseMode } : {}),
      // Don't fail the whole send if the replied-to message was deleted.
      allow_sending_without_reply: true,
      disable_web_page_preview: true,
    };

    try {
      await callTelegram("sendMessage", payload);
    } catch (err) {
      // Most likely a markdown-parsing rejection — retry as plain text.
      console.error("sendMessage (markdown) failed, retrying as plain:", err.message);
      delete payload.parse_mode;
      await callTelegram("sendMessage", payload);
    }
  }
}

/**
 * Acknowledge an inline-keyboard button press (stops the loading spinner).
 * Fire-and-forget; never throws.
 */
export async function answerCallbackQuery(callbackQueryId, text) {
  try {
    await callTelegram("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...(text ? { text } : {}),
    });
  } catch (err) {
    console.error("answerCallbackQuery failed:", err.message);
  }
}

/**
 * Edit a previously sent bot message (used to replace the language-picker
 * prompt with the translation). Falls back to plain text on markdown errors.
 * Note: editMessageText does not support chunking — keep text under the cap.
 */
export async function editMessageText(chatId, messageId, text, { parseMode = "Markdown" } = {}) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: String(text || "").trim() || "(empty response)",
    ...(parseMode ? { parse_mode: parseMode } : {}),
    disable_web_page_preview: true,
  };

  try {
    await callTelegram("editMessageText", payload);
  } catch (err) {
    console.error("editMessageText (markdown) failed, retrying as plain:", err.message);
    delete payload.parse_mode;
    await callTelegram("editMessageText", payload);
  }
}

// Split long responses on paragraph/line boundaries where possible.
function splitMessage(text) {
  const safe = String(text || "").trim() || "(empty response)";
  if (safe.length <= MAX_MESSAGE_LENGTH) return [safe];

  const chunks = [];
  let remaining = safe;
  while (remaining.length > MAX_MESSAGE_LENGTH) {
    let cut = remaining.lastIndexOf("\n", MAX_MESSAGE_LENGTH);
    if (cut < MAX_MESSAGE_LENGTH * 0.5) cut = MAX_MESSAGE_LENGTH; // no good break point
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
