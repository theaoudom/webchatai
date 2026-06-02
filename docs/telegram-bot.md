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

- `src/service/aiCommands.js` — command → prompt map + stateless `generateAIResponse()`.
- `src/service/telegram.js` — `sendMessage` / `sendChatAction` (typing indicator, markdown, auto-chunking).
- `src/utils/rateLimiter.js` — per-user cooldown + per-minute limit (in-memory anti-spam).

## Commands

| Command       | Behavior                          |
| ------------- | --------------------------------- |
| `/ask`        | General AI assistant response     |
| `/fix`        | Fix grammar & improve writing     |
| `/explain`    | Explain code or text simply       |
| `/summarize`  | Summarize content with key points |
| `/translate`  | Translate text to English         |
| `/start` `/help` | Show usage help                |

Usage: **reply** to a message and send a command, e.g. `/ask`. You can also pass
text inline: `/ask How do I fix this Kotlin crash?`. With neither a reply nor
inline text, the bot replies: _"Please reply to a message first…"_.

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
       "allowed_updates": ["message"]
     }'
   ```

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
       {"command":"translate","description":"Translate to English"}
     ]}'
   ```

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
