# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Official site: **https://www.get-domai.xyz/**

"DomAI" (package name `domai`) — a Next.js 15 App Router app (React 19, JavaScript, no TypeScript) that is three products in one codebase, all backed by Google **Gemini**:

1. **Web chat** (`/chat`) — a branded Gemini chat UI with a model selector.
2. **Telegram bot** — reply-to-a-message AI commands (`/ask`, `/fix`, `/translate`, `/slides`, …) served from a webhook route.
3. **"Learn With Me"** (`/learnWithMe`) — a gamified language-learning app (Korean/English) with AI tutoring, speech feedback, and a set of browser games (`/games`).

User-facing branding: the assistant is always presented as **"Dom"** / **"Dom-AI"** (e.g. "Dom 1.0 pro, trained by DomAI Technologies"). The underlying Gemini model id is never shown to users — see `src/data/models.js`, which maps real model ids to Dom-branded labels.

## Commands

```bash
yarn dev              # dev server at http://localhost:3000
yarn build            # production build (Vercel uses this)
yarn start            # serve a production build
yarn lint             # ESLint (next/core-web-vitals)
yarn generate-audio   # one-off: regenerate TTS audio via generateAudio.js (gtts)
```

There is **no test suite**. Verify changes by running the app. To exercise the bot backend without Telegram:

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"type":"ask","message":"How to fix a Kotlin NullPointerException?"}'
```

Note: `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` (ESLint v9 + FlatCompat breaks Vercel builds), so `yarn build` does **not** lint — run `yarn lint` yourself.

## Two distinct Gemini paths (important)

There are **two separate, intentionally different** Gemini integrations. Pick the right one when touching AI code:

- **`src/service/gemini.js`** — the **web chat** path. Keeps a **module-level `conversationHistory`** array (stateful) and reads `NEXT_PUBLIC_GEMINI_API_KEY` / `NEXT_PUBLIC_GEMINI_API_URL`. Also hosts `getTutorChatResponse` / `getSpeechFeedback` for Learn-With-Me. The module-level state means it is **not** safe for multi-user serverless reuse — it is for the single-user browser session.

- **`src/service/aiCommands.js`** — the **stateless, command-driven** path used by the Telegram bot **and** `POST /api/ai/chat`. No shared state, safe per-request in serverless. Defines the `COMMANDS` map (command → system prompt) and `generateAIResponse(type, message, opts)`, plus `generateSlideDeck()`. Uses server-only `GEMINI_API_KEY` (falls back to the `NEXT_PUBLIC_` one) and `GEMINI_BOT_MODEL` (default `gemini-2.5-flash-lite`).

Key prompt-design conventions in `aiCommands.js`:
- Commands with `treatAsData: true` (fix/explain/summarize/translate) wrap the user's text in `"""…"""` delimiters and instruct the model to operate **on** the text rather than answer it — a deliberate prompt-injection guard so "Is it possible to…?" gets corrected/translated, not answered.
- `preserveLength: true` (fix/translate) opts a command **out** of the brevity instruction so the full content is returned.
- `concise` option (set true on the Telegram surface) appends plain-text formatting + brevity instructions, because Telegram does not render Markdown.

## Telegram bot architecture

```
Telegram → POST /api/telegram/webhook → aiCommands (Gemini) → telegram.js → reply
```

- **`src/app/api/telegram/webhook/route.js`** — the orchestrator. Parses commands (`parseCommand` handles `/cmd@BotName` group syntax), pulls content from the **replied-to message** and/or inline text, runs rate-limiting, calls Gemini, and replies. **Always returns HTTP 200** so Telegram never retries; user-facing errors are sent into the chat instead. Verifies `x-telegram-bot-api-secret-token` against `TELEGRAM_WEBHOOK_SECRET`.
- `/translate` shows an inline **language-picker keyboard**; button presses arrive as `callback_query` updates (`handleCallback`) — so the webhook must be registered with `allowed_updates` including `callback_query`.
- `/slides` → `generateSlideDeck()` returns structured JSON (Gemini `responseSchema`), then `src/service/slides.js` renders it to a `.pptx` buffer with `pptxgenjs` (pure-JS mode, no headless browser) and `telegram.js#sendDocument` uploads it. Optional leading count: `/slides 12 <topic>` (clamped to `SLIDES_MIN`–`SLIDES_MAX`).
- `/alarm` → reminders. Serverless has no always-on timer, so instead of a `setTimeout` the webhook parses the request with `src/service/alarms.js#parseAlarm` (Gemini → clean reminder text + absolute fire time, interpreted in `ALARM_TIMEZONE`), then schedules an **Upstash QStash** callback (`src/service/qstash.js`) to `POST /api/telegram/alarm` at the fire time. That route verifies the QStash signature and sends the reminder. QStash holds the pending reminder (no DB). Requires `QSTASH_*` env vars; without them `/alarm` tells the user reminders aren't set up. No `/cancel` yet (would need a chat→messageId store).
- **`src/service/telegram.js`** — Bot API wrapper. `sendMessage` auto-chunks at `MAX_MESSAGE_LENGTH` (4000) and **retries as plain text if Markdown parsing fails**.
- **`src/utils/rateLimiter.js`** — in-memory per-user cooldown + per-minute cap. State is per-process, so on serverless it resets on cold start and is not shared across instances (acceptable anti-spam, not a global limit).

Full setup (BotFather, `setWebhook`, env vars) is documented in `docs/telegram-bot.md`.

## Learn-With-Me / games

- Routes under `src/app/learnWithMe/` (language picker → `[language]` → `lesson/[id]`); games under `src/app/games/`.
- Curriculum content is static JSON: `src/data/korean.json`, `src/data/english.json`, read via `src/service/curriculumService.js`.
- **All user state is client-side `localStorage`** — there is no database. Chat history (`src/service/chatHistory.js`, key `chat-history`), learning progress/streaks/points (`src/service/progressService.js`, key `languageAppProgress`), theme, and model choice all persist only in the browser. Progress changes dispatch a `progressUpdated` window event that components listen for.
- AI tutoring/speech-feedback go through `POST /api/learnWithAI` and `POST /api/learnWithAI/feedback` → `service/gemini.js`.

## Conventions

- **Imports:** `jsconfig.json` defines the `@/*` → `./src/*` alias. UI/page code uses it; the API routes and bot services currently use **relative paths** (`../../../../service/...`). Match the surrounding file.
- **Theming:** `src/context/ThemeContext.js` toggles `dark`/`light`/`pink`/`blue`/`purple` classes on `<html>`; default is `dark`. Tailwind CSS v4 (configured via `@tailwindcss/postcss`, no `tailwind.config`).
- Components live in `src/components/` (`.jsx`); services in `src/service/`; pure helpers in `src/utils/`; static content/data in `src/data/`.
- `app-info-parser` and its native deps are pinned to the server via `serverExternalPackages` in `next.config.mjs` — don't import them into client bundles.

## Environment variables

```bash
NEXT_PUBLIC_GEMINI_API_KEY    # web chat (browser-exposed)
NEXT_PUBLIC_GEMINI_API_URL    # web chat default Gemini endpoint
GEMINI_API_KEY                # server bot path (falls back to NEXT_PUBLIC_ one)
GEMINI_BOT_MODEL              # optional, default gemini-2.5-flash-lite
TELEGRAM_BOT_TOKEN            # bot
TELEGRAM_WEBHOOK_SECRET       # verified on every webhook call
TELEGRAM_COOLDOWN_MS          # optional, default 3000
TELEGRAM_MAX_PER_MINUTE       # optional, default 12

QSTASH_TOKEN                  # /alarm reminders: schedule callbacks (Upstash QStash)
QSTASH_CURRENT_SIGNING_KEY    # /alarm: verify incoming QStash callbacks
QSTASH_NEXT_SIGNING_KEY       # /alarm: signing-key rotation
APP_BASE_URL                  # /alarm: public URL QStash calls back, default https://www.get-domai.xyz
ALARM_TIMEZONE                # optional, default Asia/Phnom_Penh
ALARM_MAX_DAYS                # optional, default 30
```
