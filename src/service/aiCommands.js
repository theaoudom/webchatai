// Stateless, command-driven Gemini helper used by the Telegram bot and the
// POST /api/ai/chat endpoint. Unlike service/gemini.js (which keeps a
// module-level conversation history), this is intentionally stateless so it is
// safe to run per-request in a serverless environment with many users.

// The server-side path (Telegram bot + /api/ai/chat) uses its OWN model,
// independent of the web chat (which reads NEXT_PUBLIC_GEMINI_API_URL and will
// have a user-facing model selector). Telegram answers are short, so we default
// to the lighter, higher-quota flash-lite model. Override with GEMINI_BOT_MODEL.
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const BOT_MODEL = process.env.GEMINI_BOT_MODEL || "gemini-2.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${BOT_MODEL}:generateContent`;

// The base persona shared by every command.
const BASE_PERSONA =
  "You are Dom-AI, a helpful, friendly and professional AI assistant. " +
  "Only when asked about your identity or the model you are based on, state " +
  "that you are Dom 1.0 pro, trained by DomAI Technologies.";

// Each command maps to a system instruction. The user's (replied) message is
// always passed separately as the content, so prompts describe the *task* only.
export const COMMANDS = {
  ask: {
    label: "Ask",
    description: "General AI assistant response",
    system:
      "Answer the user clearly and professionally. Be concise and accurate.",
  },
  fix: {
    label: "Fix",
    description: "Fix grammar and improve writing",
    system:
      "Fix the grammar and improve the following text professionally. " +
      "Return only the improved text, without commentary or quotation marks.",
  },
  explain: {
    label: "Explain",
    description: "Explain code or text simply",
    system:
      "Explain the following in a simple and professional way. If it is code, " +
      "describe what it does and call out anything notable.",
  },
  summarize: {
    label: "Summarize",
    description: "Summarize content",
    system:
      "Summarize the following clearly, capturing the most important points. " +
      "Prefer a short paragraph or a tight bullet list.",
  },
  translate: {
    label: "Translate",
    description: "Translate text to English",
    system:
      "Translate the following text to English. Preserve meaning and tone. " +
      "Return only the translation.",
  },
};

export const isValidCommand = (type) =>
  typeof type === "string" && Object.prototype.hasOwnProperty.call(COMMANDS, type);

// Extra instruction for chat surfaces (Telegram) where long answers are hard to
// read. Keeps responses short and scannable on a phone.
const CONCISE_INSTRUCTION =
  "Keep your answer concise and easy to read on a small mobile chat screen. " +
  "Get straight to the point, use short sentences and tight bullet lists, and " +
  "skip long preambles or repetitive summaries. Aim for under ~120 words unless " +
  "the user explicitly asks for more detail.";

/**
 * Run a single command-driven Gemini request.
 * @param {string} type - one of the keys in COMMANDS (ask/fix/explain/translate/summarize)
 * @param {string} message - the text to act on (e.g. the replied-to Telegram message)
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - optional fetch abort signal
 * @param {boolean} [options.concise] - request a short, chat-friendly answer
 * @returns {Promise<string>} the model's text response
 * @throws {Error} when the type is invalid, the message is empty, or the API fails
 */
export const generateAIResponse = async (type, message, options = {}) => {
  const { signal, concise = false } = options;
  if (!isValidCommand(type)) {
    throw new Error(`Unknown command type: "${type}"`);
  }

  const text = (message || "").trim();
  if (!text) {
    throw new Error("Empty message");
  }

  if (!API_KEY || !API_URL) {
    throw new Error("Gemini API is not configured (missing key or URL)");
  }

  const command = COMMANDS[type];

  const systemText = concise
    ? `${BASE_PERSONA}\n\n${command.system}\n\n${CONCISE_INSTRUCTION}`
    : `${BASE_PERSONA}\n\n${command.system}`;

  const systemInstruction = {
    parts: [{ text: systemText }],
  };

  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text }] }],
    systemInstruction,
  });

  // Gemini's free tier rate-limits aggressively (429) and occasionally reports
  // the model as overloaded (503). Both are transient, so retry a couple of
  // times with a short backoff before giving up.
  const RETRYABLE = new Set([429, 500, 503]);
  const MAX_RETRIES = 2;

  let lastStatus;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY,
      },
      body,
      signal,
    });

    if (response.ok) {
      const data = await response.json();
      const modelResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!modelResponse) {
        throw new Error("Gemini returned an empty response");
      }
      return modelResponse;
    }

    lastStatus = response.status;
    if (RETRYABLE.has(response.status) && attempt < MAX_RETRIES) {
      // 600ms, then 1200ms — usually enough to clear a per-minute burst limit.
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      continue;
    }
    break;
  }

  const err = new Error(`Gemini HTTP error: ${lastStatus}`);
  err.status = lastStatus;
  throw err;
};
