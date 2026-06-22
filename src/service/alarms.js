// Parse a natural-language /alarm request into a clean reminder message and an
// absolute fire time, using the same stateless Gemini path as aiCommands.js.
//
// Example: "/alarm go to eat 4:00 PM" →
//   { ok: true, reminder: "Go to eat", fireAtMs: <today 16:00 in tz> }
//
// Time arithmetic ("4 PM", "in 30 minutes", "tomorrow 9am") is done by the
// model: we hand it the current wall-clock time and UTC offset for the target
// timezone and ask it to return an ISO-8601 timestamp, which we then validate.

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const BOT_MODEL = process.env.GEMINI_BOT_MODEL || "gemini-2.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${BOT_MODEL}:generateContent`;

// Reminders are interpreted in this timezone (the user base is in Cambodia,
// UTC+7, which has no DST). Override with ALARM_TIMEZONE.
export const ALARM_TIMEZONE = process.env.ALARM_TIMEZONE || "Asia/Phnom_Penh";

// How far ahead an alarm may be set. QStash delivers far-future messages, but a
// sane cap stops typos ("year 3024") from parking a message for centuries.
export const ALARM_MAX_DAYS = Number(process.env.ALARM_MAX_DAYS) || 30;

// JSON shape we force Gemini to return.
const ALARM_SCHEMA = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    reminder: { type: "string" },
    fireAt: { type: "string" }, // ISO-8601 with timezone offset
    error: { type: "string" },
  },
  required: ["ok"],
};

// Current wall-clock time in the target zone, e.g. "Monday, 2026-06-22 14:35".
function nowInZone(tz, date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("weekday")}, ${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

// UTC offset string for the zone, e.g. "+07:00". Derived from longOffset
// ("GMT+07:00") and normalised so it can be appended to an ISO timestamp.
function offsetInZone(tz, date) {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name || "");
  if (!m) return "+00:00";
  const sign = m[1];
  const hh = m[2].padStart(2, "0");
  const mm = m[3] || "00";
  return `${sign}${hh}:${mm}`;
}

function alarmSystem(nowStr, tz, offset) {
  return (
    "You convert a reminder request into structured data. Output JSON only.\n\n" +
    `The current date and time is ${nowStr} in the ${tz} timezone (UTC offset ${offset}).\n\n` +
    "From the user's text, produce:\n" +
    '- "reminder": a short, clear, friendly reminder message — what to remind ' +
    "the user about, with the time/date words removed and spelling/grammar " +
    "tidied. Keep it in the user's original language. Do NOT add quotes.\n" +
    '- "fireAt": the absolute date-time to send the reminder, as an ISO-8601 ' +
    `string WITH the offset ${offset} (e.g. 2026-06-22T16:00:00${offset}).\n\n` +
    "Rules:\n" +
    `- Interpret all clock times in ${tz}.\n` +
    "- If only a time of day is given and it has already passed today, schedule " +
    "it for the next day.\n" +
    '- Support relative times like "in 30 minutes" or "in 2 hours".\n' +
    '- If you cannot find any time or duration in the text, set "ok" to false ' +
    'and put a one-line reason in "error" (do not invent a time). Otherwise set ' +
    '"ok" to true.'
  );
}

/**
 * Parse a free-text alarm request.
 * @param {string} text - e.g. "go to eat 4:00 PM" or "in 30 min stand up"
 * @param {object} [options]
 * @param {Date} [options.now] - injectable clock (tests); defaults to new Date()
 * @returns {Promise<{ok:boolean, reminder?:string, fireAtMs?:number, error?:string}>}
 *   ok=true → reminder + fireAtMs (epoch ms) are set; ok=false → error explains why.
 * @throws {Error} only when the API is unconfigured or the HTTP call fails (err.status set)
 */
export async function parseAlarm(text, options = {}) {
  const raw = (text || "").trim();
  if (!raw) return { ok: false, error: "empty request" };
  if (!API_KEY) throw new Error("Gemini API is not configured (missing key)");

  const now = options.now || new Date();
  const nowStr = nowInZone(ALARM_TIMEZONE, now);
  const offset = offsetInZone(ALARM_TIMEZONE, now);

  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: raw }] }],
    systemInstruction: { parts: [{ text: alarmSystem(nowStr, ALARM_TIMEZONE, offset) }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ALARM_SCHEMA,
    },
  });

  const RETRYABLE = new Set([429, 500, 503]);
  const MAX_RETRIES = 2;

  let lastStatus;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": API_KEY },
      body,
      signal: options.signal,
    });

    if (response.ok) {
      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) return { ok: false, error: "could not understand the request" };

      let parsed;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        return { ok: false, error: "could not understand the request" };
      }

      if (!parsed?.ok) {
        return { ok: false, error: parsed?.error || "no time found in your request" };
      }

      const reminder = (parsed.reminder || "").trim();
      const fireAtMs = Date.parse(parsed.fireAt);
      if (!reminder || Number.isNaN(fireAtMs)) {
        return { ok: false, error: "could not work out what or when to remind you" };
      }

      const deltaMs = fireAtMs - now.getTime();
      if (deltaMs <= 0) {
        return { ok: false, error: "that time is already in the past" };
      }
      if (deltaMs > ALARM_MAX_DAYS * 24 * 60 * 60 * 1000) {
        return { ok: false, error: `I can only set reminders up to ${ALARM_MAX_DAYS} days ahead` };
      }

      return { ok: true, reminder, fireAtMs };
    }

    lastStatus = response.status;
    if (RETRYABLE.has(response.status) && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      continue;
    }
    break;
  }

  const err = new Error(`Gemini HTTP error: ${lastStatus}`);
  err.status = lastStatus;
  throw err;
}

/**
 * Format a fire time for the confirmation message, in the alarm timezone.
 * e.g. "Mon, Jun 22, 4:00 PM".
 */
export function formatFireTime(fireAtMs) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ALARM_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(fireAtMs));
}
