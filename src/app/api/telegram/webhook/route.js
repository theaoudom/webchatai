import { NextResponse } from "next/server";
import {
  COMMANDS,
  isValidCommand,
  generateAIResponse,
  generateSlideDeck,
} from "../../../../service/aiCommands";
import {
  sendMessage,
  sendChatAction,
  sendDocument,
  answerCallbackQuery,
  editMessageText,
  MAX_MESSAGE_LENGTH,
} from "../../../../service/telegram";
import { buildPptx } from "../../../../service/slides";
import { checkRateLimit } from "../../../../utils/rateLimiter";

const SECRET_TOKEN = process.env.TELEGRAM_WEBHOOK_SECRET;

const HELP_TEXT =
  "*Dom-AI* — AI directly in your chats.\n\n" +
  "Reply to any message, then send one of:\n" +
  "/ask — general AI answer\n" +
  "/fix — fix grammar & improve writing\n" +
  "/explain — explain code or text simply\n" +
  "/summarize — summarize the content\n" +
  "/translate — translate (pick a language, or e.g. `/translate khmer`)\n" +
  "/slides — build a PowerPoint deck on a topic, e.g. `/slides The history of AI`\n\n" +
  "You can also type the text inline, e.g. `/ask How do I fix this Kotlin crash?`";

// Languages offered by the /translate inline keyboard. `name` is the English
// language name fed into the prompt; `label` is what the button shows.
const LANGUAGES = [
  { code: "en", label: "English", name: "English" },
  { code: "km", label: "ខ្មែរ", name: "Khmer" },
  { code: "fr", label: "Français", name: "French" },
  { code: "zh", label: "中文", name: "Chinese" },
  { code: "ja", label: "日本語", name: "Japanese" },
  { code: "ko", label: "한국어", name: "Korean" },
  { code: "vi", label: "Tiếng Việt", name: "Vietnamese" },
];

// Two buttons per row.
const LANGUAGE_KEYBOARD = {
  inline_keyboard: LANGUAGES.reduce((rows, lang, i) => {
    const button = { text: lang.label, callback_data: `tr:${lang.code}` };
    if (i % 2 === 0) rows.push([button]);
    else rows[rows.length - 1].push(button);
    return rows;
  }, []),
};

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

  // Inline-keyboard button presses (the /translate language picker).
  const callback = update?.callback_query;
  if (callback) {
    try {
      await handleCallback(callback);
    } catch (err) {
      console.error("Telegram callback handler error:", err);
      await answerCallbackQuery(callback.id, "Something went wrong. Please try again.");
    }
    return NextResponse.json({ ok: true });
  }

  // Otherwise we only handle plain messages (ignore edited messages, etc.).
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

  if (command === "slides") {
    await handleSlides(message, inlineText);
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

  // Use the replied-to message as the content. If the user ALSO typed text
  // after the command, treat that as a specific request about the replied
  // message (e.g. reply to a code block + "/ask why does this crash?").
  const repliedText = (
    message.reply_to_message?.text ||
    message.reply_to_message?.caption ||
    ""
  ).trim();

  let input;
  let targetLanguage;

  if (command === "translate") {
    // /translate supports an optional inline language ("/translate khmer" or
    // "/translate khmer <text>"). Without one, show the language picker. The
    // picker replies to the message that CONTAINS the text (the replied-to
    // message, or the "/translate <text>" command itself), so the callback
    // handler can recover the text via reply_to_message later.
    const { language, rest } = extractLanguage(inlineText);
    input = repliedText || rest;

    if (!input) {
      await sendMessage(chatId, NO_REPLY_MSG, { replyTo: message.message_id });
      return;
    }

    if (!language) {
      const textMessageId = repliedText
        ? message.reply_to_message.message_id
        : message.message_id;
      await sendMessage(chatId, "Translate to which language?", {
        replyTo: textMessageId,
        replyMarkup: LANGUAGE_KEYBOARD,
      });
      return;
    }

    targetLanguage = language; // fall through to the normal AI path
  } else if (repliedText && inlineText) {
    input = `${inlineText}\n\nReferenced message:\n"""${repliedText}"""`;
  } else {
    input = repliedText || inlineText;
  }

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
    response = await generateAIResponse(command, input, { concise: true, targetLanguage });
  } catch (err) {
    console.error(`generateAIResponse(${command}) failed:`, err.status || "", err.message);
    const msg =
      err.status === 429
        ? "I'm getting a lot of requests right now. Please try again in a few seconds."
        : AI_DOWN_MSG;
    await sendMessage(chatId, msg, { replyTo: message.message_id });
    return;
  }

  await sendMessage(chatId, response, { replyTo: message.message_id });
}

/**
 * /slides — generate a PowerPoint deck for a topic and send it as a document.
 * Topic comes from the inline text ("/slides <topic>") or the replied-to message.
 */
async function handleSlides(message, inlineText) {
  const chatId = message.chat.id;
  const userId = message.from?.id ?? chatId;

  const repliedText = (
    message.reply_to_message?.text ||
    message.reply_to_message?.caption ||
    ""
  ).trim();
  const topic = inlineText || repliedText;

  if (!topic) {
    await sendMessage(
      chatId,
      "What should the slides be about? e.g. /slides The history of AI",
      { replyTo: message.message_id }
    );
    return;
  }

  const limit = checkRateLimit(userId);
  if (!limit.allowed) {
    const wait = limit.retryAfter ? ` (try again in ${limit.retryAfter}s)` : "";
    await sendMessage(chatId, `You're going too fast.${wait}`, { replyTo: message.message_id });
    return;
  }

  // Building a deck takes longer than a chat reply, so tell the user it's coming.
  await sendChatAction(chatId, "upload_document");
  await sendMessage(chatId, "Building your slides… 📊", { replyTo: message.message_id });

  let deck;
  try {
    deck = await generateSlideDeck(topic);
  } catch (err) {
    console.error("generateSlideDeck failed:", err.status || "", err.message);
    const msg =
      err.status === 429
        ? "I'm getting a lot of requests right now. Please try again in a few seconds."
        : AI_DOWN_MSG;
    await sendMessage(chatId, msg, { replyTo: message.message_id });
    return;
  }

  try {
    const { buffer, filename } = await buildPptx(deck);
    await sendDocument(chatId, buffer, filename, {
      caption: deck.title,
      replyTo: message.message_id,
      contentType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
  } catch (err) {
    console.error("buildPptx/sendDocument failed:", err.message);
    await sendMessage(chatId, "I built the slides but couldn't send the file. Please try again.", {
      replyTo: message.message_id,
    });
  }
}

/**
 * Pull an optional leading language off /translate's inline text.
 * Matches a code ("km"), English name ("khmer"), or native label ("ខ្មែរ")
 * from LANGUAGES — case-insensitive. Anything unrecognized is treated as
 * text to translate, so "/translate Hello world" still works.
 * Returns { language: <English name>|null, rest: <remaining text> }.
 */
function extractLanguage(text) {
  if (!text) return { language: null, rest: "" };

  const spaceIdx = text.search(/\s/);
  const first = (spaceIdx === -1 ? text : text.slice(0, spaceIdx)).toLowerCase();
  const lang = LANGUAGES.find(
    (l) => l.code === first || l.name.toLowerCase() === first || l.label.toLowerCase() === first
  );

  if (!lang) return { language: null, rest: text };
  return {
    language: lang.name,
    rest: spaceIdx === -1 ? "" : text.slice(spaceIdx + 1).trim(),
  };
}

/**
 * Handle a language-picker button press (callback_data "tr:<code>").
 * The picker message is a reply to the message containing the text to
 * translate, so we recover the text from callback.message.reply_to_message.
 */
async function handleCallback(callback) {
  const data = callback.data || "";
  const pickerMessage = callback.message;

  const match = /^tr:([a-z]{2})$/.exec(data);
  const lang = match && LANGUAGES.find((l) => l.code === match[1]);
  if (!lang || !pickerMessage) {
    await answerCallbackQuery(callback.id);
    return;
  }

  const chatId = pickerMessage.chat.id;
  const userId = callback.from?.id ?? chatId;

  // Anti-spam (button presses hit the AI just like commands do).
  const limit = checkRateLimit(userId);
  if (!limit.allowed) {
    const wait = limit.retryAfter ? ` Try again in ${limit.retryAfter}s.` : "";
    await answerCallbackQuery(callback.id, `You're going too fast.${wait}`);
    return;
  }

  // Recover the text to translate from the message the picker replied to.
  const source = pickerMessage.reply_to_message;
  let text = (source?.text || source?.caption || "").trim();
  // If it was an inline command ("/translate <text>"), strip the command part.
  if (text.startsWith("/")) {
    text = parseCommand(text)?.inlineText || "";
  }

  if (!text) {
    await answerCallbackQuery(callback.id, "I can't find the original message anymore.");
    await editMessageText(chatId, pickerMessage.message_id, NO_REPLY_MSG);
    return;
  }

  // Acknowledge the tap right away, then show progress while Gemini runs.
  await answerCallbackQuery(callback.id);
  await editMessageText(chatId, pickerMessage.message_id, `Translating to ${lang.name}…`);
  await sendChatAction(chatId, "typing");

  let response;
  try {
    response = await generateAIResponse("translate", text, {
      concise: true,
      targetLanguage: lang.name,
    });
  } catch (err) {
    console.error("generateAIResponse(translate) failed:", err.status || "", err.message);
    const msg =
      err.status === 429
        ? "I'm getting a lot of requests right now. Please try again in a few seconds."
        : AI_DOWN_MSG;
    await editMessageText(chatId, pickerMessage.message_id, msg);
    return;
  }

  // Replace the picker with the translation; very long results need the
  // chunked send path instead (editMessageText cannot split messages).
  if (response.length <= MAX_MESSAGE_LENGTH) {
    await editMessageText(chatId, pickerMessage.message_id, response);
  } else {
    await editMessageText(chatId, pickerMessage.message_id, `Translated to ${lang.name} below 👇`);
    await sendMessage(chatId, response, { replyTo: source.message_id });
  }
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
