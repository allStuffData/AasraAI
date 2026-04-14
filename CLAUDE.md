# CLAUDE.md — AasraAI Project Context

## Project Overview

**Aasra AI** (आसरा = "support/shelter") is a voice-first Android app for seniors (60+) in India. It lets them call, text, and send SOS alerts using natural conversation in Hindi, English, and Hinglish. An LLM (Z.AI GLM) powers the conversational intent parsing layer.

**Tagline:** "Bolo, aur ho jaayega." (Say it, and it's done.)

Full PRD: `docs/prd.md`

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native via Expo SDK 53 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Database | expo-sqlite (local, no cloud) |
| STT | expo-speech-recognition (Android on-device) |
| TTS | expo-speech (Android on-device) |
| LLM | Z.AI GLM-5.1 (OpenAI-compatible API, streaming) |
| Build | EAS Build (Expo Application Services) |

## Project Structure

```
app/                    # Expo Router screens
  index.tsx             # Home (Talk button, SOS, favorites grid)
  conversation.tsx      # Voice interaction overlay
  confirmation.tsx      # Action confirmation (Yes/No)
  settings/             # PIN-protected caregiver settings
src/
  services/             # All business logic as service modules
  stores/               # Zustand stores (conversation, contacts, settings)
  db/                   # SQLite schema + migrations
  utils/                # Intent parser, fuzzy matching
  constants/            # Theme (colors/fonts/sizes), LLM prompts
assets/                 # Icons, images, sounds
docs/                   # PRD, implementation checklist
```

## Key Architecture Decisions

1. **Voice-first, touch-second.** Everything achievable by voice. Touch is fallback.
2. **No text input ever.** Seniors don't type.
3. **LLM returns structured JSON** — intent, contact, message_body, spoken_response, needs_confirmation, language.
4. **Contact resolution is local.** Phone numbers never sent to LLM. Only contact names.
5. **Confirmation required** for all destructive actions (call, text, SOS).
6. **SOS is instant** — 3-second long-press bypasses confirmation. SOS must never fail.
7. **Offline fallback** — when no internet, show favorites grid for tap-to-call.
8. **Zero telemetry.** No analytics, no accounts, no cloud sync in v1.

## Flow

```
User taps "Talk" → STT listens → transcribes → LLM parses intent → TTS speaks confirmation → User confirms → Action executes (call/SMS/SOS)
```

## Coding Conventions

- **TypeScript strict mode** — no `any`, use proper types
- **Service pattern** — each domain (call, sms, contacts, etc.) is a standalone service module
- **Zustand stores** — single source of truth per domain
- **expo-sqlite** for all persistent data (contacts, call log, settings, chat history)
- **Fuzzy matching** via Fuse.js for contact name resolution
- **Bilingual everything** — all user-facing strings in Hindi + English

## UI Design Rules

- **Minimum 64dp touch targets** (Android standard is 48dp, we go bigger)
- **Noto Sans font** — supports Devanagari + Latin
- **Body text: 20sp minimum**, headings 28sp+
- **Colors:** Primary #1565C0 (blue), SOS #D32F2F (red), Background #FFFFFF, Text #212121
- **High contrast (WCAG AAA)**
- **Filled icons**, not outlined, minimum 32dp
- **Subtle animations only** — pulsing mic, gentle transitions

## LLM Integration

- **Endpoint:** `https://api.z.ai/api/coding/paas/v4/chat/completions`
- **Model:** `glm-5.1`
- **Streaming:** Yes (`stream: true`)
- **Max tokens:** 256 (short responses only)
- **Temperature:** 0.3 (low creativity, high reliability)
- **Context budget:** ~3000 tokens (2000 contacts + 500 history + 500 system prompt)
- **Rolling context:** Last 5 turns, cleared after 5 min inactivity

**Important:** The LLM wraps JSON responses in markdown code fences (`\`\`\`json ... \`\`\``). The intent parser must strip these before parsing.

## Permissions (Requested Contextually)

- `RECORD_AUDIO` — first launch (STT)
- `READ_CONTACTS` — during setup
- `CALL_PHONE` — first call attempt
- `SEND_SMS` / `READ_SMS` — first text attempt
- `ACCESS_FINE_LOCATION` — during SOS setup
- Each permission explained in user's language (Hindi/English)

## Build & Deploy

- `npx expo start` — dev server
- `eas build --platform android` — production APK
- `eas update` — OTA JS bundle updates
- Target: Android 8.0+ (API 26), APK < 30MB

## Testing Notes

- STT and calling only work on physical Android devices (not simulators for telephony)
- LLM can be tested via curl (see .env for API key)
- SOS reliability is critical — 100% success rate required

## Common Gotchas

- **expo-speech-recognition** needs `RECORD_AUDIO` permission granted before use
- **expo-linking** `tel:` intent opens the system dialer — app doesn't handle the call itself
- **expo-sms** may not work on emulators — test on real device
- **LLM response parsing** — always strip markdown fences before JSON.parse
- **GPS** may be degraded indoors — SOS should still send SMS even without location

## Development Setup

```bash
npm install
npx expo start
# Scan QR with Expo Go on Android device
```

API key in `.env` (gitignored). Copy `.env.example` to `.env` and add your Z.AI key.
