# Dom-AI Telegram Bot

AI directly inside Telegram chats, powered by Gemini. Reply to any message and
run a command (`/ask`, `/fix`, `/explain`, `/summarize`, `/translate`) — the bot
sends the replied text to Gemini and posts the answer back into the chat.

Works in private chats and groups. In groups the bot only responds when a command
is used, so it stays quiet otherwise.

## Architecture

```
Telegram User → Telegram → POST /api/telegram/webhook → Gemini API → reply
```

Two server routes were added to the existing Next.js app:

| Route                     | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `POST /api/telegram/webhook` | Receives Telegram updates, parses commands, replies in-chat.    |
| `POST /api/ai/chat`          | Reusable backend AI endpoint (`{type, message}` → `{success, response}`). |

Supporting modules:

- `src/service/aiCommands.js` — command → prompt map + stateless `generateAIResponse()`; `generateSlideDeck()` (structured JSON deck for `/slides`).
- `src/service/slides.js` — renders a deck object into a `.pptx` buffer with `pptxgenjs` (pure JS, no headless browser).
- `src/service/telegram.js` — `sendMessage` / `sendChatAction` / `sendDocument` (typing indicator, markdown, auto-chunking, file upload).
- `src/utils/rateLimiter.js` — per-user cooldown + per-minute limit (in-memory anti-spam).

## Commands

| Command       | Behavior                          |
| ------------- | --------------------------------- |
| `/ask`        | General AI assistant response     |
| `/fix`        | Fix grammar & improve writing     |
| `/explain`    | Explain code or text simply       |
| `/summarize`  | Summarize content with key points |
| `/translate`  | Translate text to English         |
| `/slides`     | Build a PowerPoint (`.pptx`) deck on a topic, sent as a document |
| `/alarm`      | Set a reminder; the bot messages you back at the chosen time |
| `/start` `/help` | Show usage help                |

Usage: **reply** to a message and send a command, e.g. `/ask`. You can also pass
text inline: `/ask How do I fix this Kotlin crash?`. With neither a reply nor
inline text, the bot replies: _"Please reply to a message first…"_.

`/slides` takes its topic from inline text (`/slides The history of AI`) or the
replied-to message. Gemini returns a structured deck (forced JSON via
`responseSchema`), which is rendered to a `.pptx` and sent with `sendDocument`.
An optional leading number sets the length: `/slides 12 The history of AI`
requests 12 slides (clamped to `SLIDES_MIN`–`SLIDES_MAX`, currently 3–30; the
bot tells the user when a request is capped). A leading 3-or-more-digit number
(e.g. a year, `/slides 2025 in review`) is treated as part of the topic.

`/alarm` sets a reminder. The text (`/alarm go to eat 4:00 PM`, `/alarm in 30
min stand up`, or a reply + `/alarm in 1 hour`) is parsed by Gemini into a clean
reminder message and an absolute fire time (interpreted in `ALARM_TIMEZONE`,
default `Asia/Phnom_Penh`). Because serverless has no always-on timer, the bot
schedules an **Upstash QStash** callback to `/api/telegram/alarm` for that time;
QStash POSTs us back at the fire time and we send the reminder. Reminders can be
set up to `ALARM_MAX_DAYS` ahead (default 30). See **Reminders (QStash) setup**
below.

## Environment variables

Add these to `.env.local` (and your Vercel project settings):

```bash
# Already used by the app for Gemini:
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

# Telegram bot:
TELEGRAM_BOT_TOKEN=123456:ABC-your-botfather-token
TELEGRAM_WEBHOOK_SECRET=a-long-random-string   # verified on every webhook call

# Optional rate-limit tuning (defaults shown):
TELEGRAM_COOLDOWN_MS=3000
TELEGRAM_MAX_PER_MINUTE=12

# Reminders (/alarm) — Upstash QStash. Get these from the QStash dashboard.
QSTASH_TOKEN=qstash_token                 # used to schedule reminder callbacks
QSTASH_CURRENT_SIGNING_KEY=sig_xxx        # used to verify incoming callbacks
QSTASH_NEXT_SIGNING_KEY=sig_yyy           # rotation key, also from the dashboard
APP_BASE_URL=https://www.get-domai.xyz    # public URL QStash calls back (no trailing slash)

# Optional /alarm tuning (defaults shown):
ALARM_TIMEZONE=Asia/Phnom_Penh
ALARM_MAX_DAYS=30
```

> The Gemini key currently uses the `NEXT_PUBLIC_` prefix to match the existing
> `service/gemini.js`. These new server routes never run in the browser, so for
> better key hygiene you can later rename it to a non-public `GEMINI_API_KEY`.

## Setup

1. **Create the bot** with [@BotFather](https://t.me/BotFather) → `/newbot`. Copy
   the token into `TELEGRAM_BOT_TOKEN`.

2. **Deploy** the app (or expose localhost via a tunnel like `ngrok http 3000`)
   so you have a public HTTPS URL.

3. **Register the webhook** (sets the secret token Telegram echoes back):

   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://YOUR_DOMAIN/api/telegram/webhook",
       "secret_token": "YOUR_TELEGRAM_WEBHOOK_SECRET",
       "allowed_updates": ["message", "callback_query"]
     }'
   ```

   > `callback_query` is required for the `/translate` language-picker buttons.
   > If you registered the webhook before they existed, re-run this command —
   > otherwise Telegram silently drops the button presses.

4. **(Groups)** To let the bot read replied messages in groups, either disable
   privacy mode in BotFather (`/setprivacy` → Disable) or make the bot a group
   admin. Then add the bot to the group.

5. **(Optional) register the command menu** so commands autocomplete:

   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{"commands":[
       {"command":"ask","description":"General AI answer"},
       {"command":"fix","description":"Fix grammar & improve writing"},
       {"command":"explain","description":"Explain code or text simply"},
       {"command":"summarize","description":"Summarize content"},
       {"command":"translate","description":"Translate (pick a language, or e.g. /translate khmer)"},
       {"command":"slides","description":"Build a PowerPoint deck on a topic"},
       {"command":"alarm","description":"Set a reminder, e.g. /alarm go to eat 4:00 PM"}
     ]}'
   ```

6. **(Reminders) set up QStash** so `/alarm` can fire callbacks — see below.

## Reminders (QStash) setup

`/alarm` relies on [Upstash QStash](https://upstash.com/docs/qstash) as the
external scheduler (serverless has no always-on timer). Without it, `/alarm`
replies _"Reminders aren't set up on this bot yet."_

1. Create a free account at [console.upstash.com](https://console.upstash.com/qstash).
2. From the QStash dashboard copy the **token** and the **current** and **next
   signing keys** into `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`,
   `QSTASH_NEXT_SIGNING_KEY`.
3. Set `APP_BASE_URL` to your public site (no trailing slash). QStash must be
   able to reach `${APP_BASE_URL}/api/telegram/alarm` — for local testing,
   point it at a tunnel (`ngrok`) URL.

Flow: webhook parses `/alarm` → schedules a QStash message with `notBefore` =
fire time → at that time QStash POSTs `/api/telegram/alarm` (signed) → the route
verifies the signature and sends the reminder. No database needed; QStash holds
the pending reminder. Setting a reminder is fire-and-forget — there is currently
no `/cancel` (that would need a store to map chats → message IDs).

## Testing the backend endpoint directly

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"type":"ask","message":"How to fix a Kotlin NullPointerException?"}'
# → { "success": true, "response": "..." }
```

## Notes & limits

- **Rate limiting is in-memory and per-instance.** On serverless it resets on
  cold start and isn't shared across instances. For strict global limits, back
  `rateLimiter.js` with Redis/Upstash.
- The webhook always returns `200` (with user-facing problems sent into the chat)
  so Telegram does not retry deliveries.
- Responses are sent with Markdown; if Gemini's markup is malformed for Telegram,
  the message is automatically re-sent as plain text. Messages over 4096 chars
  are split into chunks.
