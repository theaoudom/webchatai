// Thin wrapper around Upstash QStash, used to power the Telegram /alarm
// (reminder) feature. The bot runs on serverless (Vercel) where there is no
// always-on process to fire a timer, so instead of keeping a setTimeout alive
// we ask QStash to call us back at the alarm time: when a user sets an alarm we
// schedule an HTTP POST to /api/telegram/alarm with `notBefore` set to the fire
// time, and QStash delivers it (and retries) for us.
//
// Two sets of credentials are involved:
//   - QSTASH_TOKEN ......... publish (schedule) messages
//   - QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY ... verify that an
//     incoming callback really came from QStash (the keys rotate, hence two)

import { Client, Receiver } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY;
const NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY;

// Public base URL QStash will call back. Defaults to the live site; override
// with APP_BASE_URL for previews/local tunnels. Trailing slash stripped so the
// callback path joins cleanly.
const BASE_URL = (process.env.APP_BASE_URL || "https://www.get-domai.xyz").replace(/\/+$/, "");

// The single endpoint QStash delivers alarm callbacks to. Exported so the
// callback route can verify the signature against the exact same URL.
export const ALARM_CALLBACK_URL = `${BASE_URL}/api/telegram/alarm`;

export const isQstashConfigured = () => Boolean(QSTASH_TOKEN);

let client;
function getClient() {
  if (!QSTASH_TOKEN) throw new Error("QSTASH_TOKEN is not configured");
  if (!client) client = new Client({ token: QSTASH_TOKEN });
  return client;
}

/**
 * Schedule a one-off callback to the alarm route at an absolute time.
 * @param {object} params
 * @param {object} params.body - JSON payload delivered back to us at fire time
 * @param {number} params.notBefore - Unix timestamp in SECONDS to fire at
 * @returns {Promise<{messageId:string}>}
 */
export async function scheduleAlarmCallback({ body, notBefore }) {
  return getClient().publishJSON({
    url: ALARM_CALLBACK_URL,
    body,
    notBefore,
  });
}

let receiver;
/**
 * Verify an incoming QStash callback signature. Fails closed (returns false)
 * if the signing keys aren't configured or verification throws, so an
 * unverified request can never trigger a message send.
 * @param {object} params
 * @param {string} params.signature - the `Upstash-Signature` header
 * @param {string} params.body - the RAW request body string (not parsed)
 * @returns {Promise<boolean>}
 */
export async function verifyAlarmCallback({ signature, body }) {
  if (!signature || !CURRENT_SIGNING_KEY || !NEXT_SIGNING_KEY) return false;
  if (!receiver) {
    receiver = new Receiver({
      currentSigningKey: CURRENT_SIGNING_KEY,
      nextSigningKey: NEXT_SIGNING_KEY,
    });
  }
  try {
    // url omitted on purpose: signature + body-hash + nbf/exp are enough to
    // authenticate, and skipping the url check avoids false negatives from
    // www/trailing-slash mismatches that would silently drop reminders.
    return await receiver.verify({ signature, body });
  } catch {
    return false;
  }
}
