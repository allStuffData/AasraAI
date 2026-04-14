# Aasra AI — Product Requirements Document

> **"Aasra"** (आसरा) — Hindi for "support" / "shelter". An AI-powered voice-first assistant that helps seniors stay connected with their loved ones.

---

## 1. Problem Statement

Seniors (60+) in India and the Indian diaspora struggle with modern smartphones. Small text, complex UIs, and multi-step workflows for basic tasks like calling or texting create a dependency on family members. Many seniors end up with expensive smartphones they can barely use beyond answering incoming calls.

Existing "senior-friendly" launchers simplify the UI but still require reading, tapping, and navigating. They don't solve the core problem: **seniors need a conversational interface, not a simplified graphical one.**

## 2. Product Vision

Aasra AI is a **voice-first Android app** (iOS later) that lets seniors **call, text, and send SOS alerts** using natural conversation in **English and Hindi**. An LLM powers the conversational layer — the senior speaks, Aasra understands intent, confirms the action, and executes it. No menus. No typing. No confusion.

### One-liner
> "Bolo, aur ho jaayega." (Say it, and it's done.)

## 3. Target Users

### Primary: Seniors (60+)
- Limited smartphone literacy
- Comfortable speaking in Hindi, English, or Hinglish
- Need to call family, friends, doctors
- Need to send simple text messages (WhatsApp or SMS)
- May have medical emergencies requiring SOS

### Secondary: Caregivers / Family Members
- Set up the app and contacts for the senior
- Configure SOS contacts and emergency info
- Monitor SOS alerts remotely

## 4. Core Features (MVP)

### 4.1 Voice-First Interaction

| Aspect | Detail |
|--------|--------|
| **Activation** | App opens to a single large "Talk to Aasra" button. Tap and speak. Always-listening mode is a v2 feature. |
| **Languages** | Hindi, English, Hinglish (code-mixed). Auto-detect language from speech. |
| **Conversation flow** | Senior speaks → STT transcribes → LLM interprets intent → TTS confirms → Senior confirms → Action executes |
| **Confirmation** | Every destructive action (call, text, SOS) requires verbal confirmation: "Kya main Raju ko call karoon?" / "Should I call Raju?" |
| **Error recovery** | If Aasra doesn't understand, it asks again in simpler language. Max 2 retries before suggesting "Bol ke dikhao: Raju ko call karo" (example prompt). |
| **Feedback** | Visual + audio feedback at every step. Large animated waveform while listening. Clear spoken confirmations. |

### 4.2 Call

| Aspect | Detail |
|--------|--------|
| **Trigger** | "Raju ko phone lagao" / "Call Raju" / "Beti ko call karo" |
| **Contact resolution** | Fuzzy match against contact list. Supports nicknames/relations ("beti", "beta", "doctor sahab"). |
| **Ambiguity** | If multiple matches: "Aapki list mein do Raju hain — Raju Sharma aur Raju Verma. Kaunsa?" |
| **Execution** | Uses Android's native dialer via intent. App doesn't handle VoIP. |
| **Call log** | Maintain a simple call history within the app (name, time, duration). |

### 4.3 Text / Message

| Aspect | Detail |
|--------|--------|
| **Trigger** | "Raju ko message bhejo — kal aa raha hoon" / "Text Raju I'm coming tomorrow" |
| **Channels** | SMS (default, v1). WhatsApp integration is v2. |
| **Compose flow** | Senior dictates → Aasra reads back the message → Senior confirms → Sent |
| **Read messages** | "Mera last message padho" / "Read my messages" — reads recent SMS aloud via TTS |
| **Reply** | "Isko reply karo — theek hai" — replies to the last read message |

### 4.4 SOS / Emergency

| Aspect | Detail |
|--------|--------|
| **Trigger** | Voice: "Emergency!" / "Madad!" / "Help!" OR dedicated large red SOS button always visible on screen |
| **Action** | Simultaneously: (1) Calls primary emergency contact, (2) Sends SMS with GPS location to all SOS contacts, (3) Optional: Calls 112 (India emergency number) |
| **SOS contacts** | Configured during setup by caregiver. Min 1, max 5. |
| **Location** | Attach GPS coordinates as Google Maps link in SMS |
| **Cooldown** | Verbal confirmation before triggering: "Kya aap emergency mein hain?" — but SOS button has a 3-second long-press override (no confirmation needed) |

### 4.5 Contact Management (Caregiver Setup)

| Aspect | Detail |
|--------|--------|
| **Setup mode** | PIN-protected settings screen (caregiver enters) |
| **Add contacts** | Name, phone number, relationship/nickname, photo (optional) |
| **Import** | Import from phone contacts (select which ones to include) |
| **Nicknames** | Each contact can have multiple aliases: "Raju", "Beta", "Son" |
| **SOS contacts** | Mark contacts as SOS. Set primary emergency contact. |
| **Favorites** | Top 4-6 contacts shown as large photo tiles on home screen for quick tap-to-call |

## 5. Tech Stack

### 5.1 Cross-Platform Framework

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | **React Native (Expo)** | Cross-platform (Android first, iOS later). Expo simplifies builds, OTA updates, and native module access. Large ecosystem. |
| **Language** | TypeScript | Type safety, better DX, catches bugs early. |
| **State management** | Zustand | Lightweight, minimal boilerplate, perfect for a simple app. |
| **Navigation** | Expo Router | File-based routing, simple and convention-driven. |
| **Local storage** | expo-sqlite | Contacts, call history, settings. Lightweight, no server needed. |

### 5.2 Voice Pipeline

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **STT (Speech-to-Text)** | **Android SpeechRecognizer API** (via expo-speech-recognition or native module) | Free, offline-capable for Hindi+English, no API costs. Google's on-device models are excellent for Indian languages. |
| **TTS (Text-to-Speech)** | **Android TextToSpeech API** (via expo-speech) | Free, offline, supports Hindi and English. Natural-sounding voices on modern Android. |
| **Fallback STT** | Google Cloud Speech-to-Text | If on-device STT quality is insufficient for Hinglish code-mixing. Pay-per-use. |

### 5.3 LLM (Conversational AI)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **LLM Provider** | **Z.AI (GLM)** | User-specified. Coding endpoint for development. |
| **Endpoint** | `https://api.z.ai/api/coding/paas/v4/chat/completions` | Coding plan endpoint. |
| **Model** | `glm-5.1` (or latest available) | Best available model on the platform. |
| **Integration** | OpenAI-compatible API (chat completions format) | Standard request/response format. Easy to swap providers later. |
| **Streaming** | Yes (`stream: true`) | For real-time TTS — start speaking as tokens arrive instead of waiting for full response. |

**LLM System Prompt Strategy:**

The LLM acts as an intent parser + response generator. It receives:
- User's transcribed speech
- Contact list (as context)
- Conversation history (last 5 turns)
- Current app state

It returns structured JSON:
```json
{
  "intent": "CALL" | "TEXT" | "SOS" | "READ_MESSAGES" | "REPLY" | "UNKNOWN" | "CHITCHAT",
  "contact": "Raju Sharma",
  "contact_phone": "+91XXXXXXXXXX",
  "message_body": "Kal aa raha hoon",
  "spoken_response": "Kya main Raju Sharma ko call karoon?",
  "needs_confirmation": true,
  "language": "hi" | "en"
}
```

### 5.4 Native Modules

| Capability | Module / API |
|------------|-------------|
| **Phone calls** | `expo-linking` (tel: intent) or `react-native-phone-call` |
| **SMS** | `expo-sms` |
| **Contacts access** | `expo-contacts` |
| **Location (SOS)** | `expo-location` |
| **Permissions** | `expo-permissions` (microphone, contacts, SMS, location, phone) |
| **Notifications** | `expo-notifications` (SOS alert confirmation) |
| **Haptics** | `expo-haptics` (SOS button feedback) |

### 5.5 Build & Deploy

| Aspect | Tool |
|--------|------|
| **Dev builds** | Expo Dev Client (on physical Android device) |
| **Production builds** | EAS Build (Expo Application Services) |
| **OTA updates** | EAS Update (push JS bundle updates without app store) |
| **CI/CD** | GitHub Actions → EAS Build → Google Play (later) |

## 6. Architecture

```
┌─────────────────────────────────────────────────┐
│                   AASRA AI APP                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  Home     │   │  SOS     │   │ Settings │    │
│  │  Screen   │   │  Button  │   │ (PIN)    │    │
│  └────┬─────┘   └────┬─────┘   └──────────┘    │
│       │               │                          │
│  ┌────▼───────────────▼─────────────────────┐   │
│  │         Voice Interaction Layer            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  │   │
│  │  │  STT    │  │  LLM    │  │   TTS    │  │   │
│  │  │ (on-    │──▶│ Intent  │──▶│ (on-    │  │   │
│  │  │ device) │  │ Parser  │  │ device)  │  │   │
│  │  └─────────┘  └────┬────┘  └──────────┘  │   │
│  └─────────────────────┼─────────────────────┘   │
│                        │                          │
│  ┌─────────────────────▼─────────────────────┐   │
│  │           Action Executor                  │   │
│  │  ┌────────┐  ┌────────┐  ┌────────────┐  │   │
│  │  │ Dialer │  │  SMS   │  │ SOS Engine │  │   │
│  │  │ Intent │  │ Sender │  │ (Call+SMS+  │  │   │
│  │  │        │  │        │  │  Location)  │  │   │
│  │  └────────┘  └────────┘  └────────────┘  │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌───────────────────────────────────────────┐   │
│  │           Local Data (SQLite)              │   │
│  │  Contacts │ Call Log │ Settings │ Chat Hx  │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
├─────────────────────────────────────────────────┤
│  Z.AI API (LLM)          │  Android Native APIs  │
│  api.z.ai/api/coding/    │  SpeechRecognizer     │
│  paas/v4/chat/completions│  TextToSpeech          │
│                           │  Telephony / SMS       │
│                           │  Location Services     │
└─────────────────────────────────────────────────┘
```

## 7. UI/UX Design Principles

### 7.1 Design Philosophy
- **Voice-first, touch-second.** Everything achievable by voice. Touch is the fallback.
- **Maximum 2 taps** for any action via touch.
- **No text input required.** Ever. Seniors don't type.
- **High contrast.** Dark text on light backgrounds. WCAG AAA compliance.
- **Massive touch targets.** Minimum 64dp for all interactive elements (Android guideline is 48dp — we go bigger).
- **No clutter.** Home screen has: Talk button, SOS button, 4-6 favorite contacts. That's it.

### 7.2 Screen Map

```
1. HOME SCREEN
   ├── Large "Talk to Aasra" button (center, animated mic icon)
   ├── SOS button (bottom-right, always visible, red)
   ├── Favorite contacts grid (4-6 large photo tiles)
   └── Status bar: battery, time, network (extra large font)

2. CONVERSATION SCREEN (overlays home when talking)
   ├── Animated waveform (listening state)
   ├── Transcribed text (large font, what Aasra heard)
   ├── Aasra's response (large font, what Aasra said)
   └── Cancel button (large, "Ruko" / "Stop")

3. CONFIRMATION SCREEN
   ├── Action summary: "Calling Raju Sharma"
   ├── Large YES button (green, "Haan" / "Yes")
   ├── Large NO button (red, "Nahi" / "No")
   └── Auto-timeout: if no response in 10s, cancel action

4. SETTINGS (PIN-protected, caregiver-only)
   ├── Manage contacts (add/edit/delete, set nicknames)
   ├── SOS contacts configuration
   ├── Language preference (Hindi / English / Auto)
   ├── Voice speed (TTS rate)
   ├── API key configuration
   └── About / Help
```

### 7.3 Visual Design

| Element | Spec |
|---------|------|
| **Font** | Noto Sans (supports Devanagari + Latin). Minimum 20sp body, 28sp headings. |
| **Colors** | Primary: #1565C0 (calming blue). SOS: #D32F2F (red). Background: #FFFFFF. Text: #212121. |
| **Icons** | Filled style, not outlined. Minimum 32dp. |
| **Animations** | Subtle. Pulsing mic when listening. Gentle transitions. No flashy effects. |
| **Photos** | Contact photos displayed as large circles (80dp+). Default avatar if no photo. |

## 8. LLM Integration Detail

### 8.1 System Prompt

```
You are Aasra, a kind and patient voice assistant for elderly people in India.
You help them make phone calls, send text messages, and handle emergencies.

RULES:
1. Always respond in the SAME language the user spoke in (Hindi, English, or Hinglish).
2. Keep responses SHORT — max 2 sentences. Seniors can't process long responses.
3. Always confirm before executing actions.
4. If you don't understand, ask again simply. Don't use technical jargon.
5. Be warm, respectful. Use "aap" (formal you) in Hindi, never "tum" or "tu".
6. For ambiguous contacts, list options clearly with numbers.
7. Return structured JSON alongside your spoken response.

AVAILABLE ACTIONS:
- CALL: Make a phone call to a contact
- TEXT: Send an SMS to a contact
- SOS: Trigger emergency alert
- READ_MESSAGES: Read recent messages aloud
- REPLY: Reply to the last read message
- CHITCHAT: General conversation (keep brief, gently redirect to actions)
- UNKNOWN: Could not understand intent

CONTACTS (provided as context per request):
{contact_list}

Respond in this JSON format:
{
  "intent": "<ACTION>",
  "contact": "<resolved contact name or null>",
  "contact_phone": "<phone number or null>",
  "message_body": "<message text for TEXT/REPLY or null>",
  "spoken_response": "<what to say to the user>",
  "needs_confirmation": true/false,
  "language": "hi" | "en"
}
```

### 8.2 API Integration

```typescript
// Service: llm.service.ts
const LLM_CONFIG = {
  endpoint: 'https://api.z.ai/api/coding/paas/v4/chat/completions',
  model: 'glm-5.1',
  maxTokens: 256,       // Short responses only
  temperature: 0.3,     // Low creativity, high reliability
  stream: true,         // Stream for faster TTS start
};
```

### 8.3 Conversation Context Management

- Maintain a rolling window of **last 5 turns** (user + assistant).
- Inject the full contact list into the system prompt on every request.
- Clear context on app restart or after 5 minutes of inactivity.
- Total context budget: ~2000 tokens (contacts) + ~500 tokens (history) + ~500 tokens (system prompt) = ~3000 tokens per request.

## 9. Permissions Required

| Permission | Why | When Requested |
|------------|-----|----------------|
| `RECORD_AUDIO` | Voice input (STT) | First app launch |
| `READ_CONTACTS` | Import phone contacts | During setup |
| `CALL_PHONE` | Make calls directly | First call attempt |
| `SEND_SMS` | Send text messages | First text attempt |
| `READ_SMS` | Read incoming messages | First "read messages" request |
| `ACCESS_FINE_LOCATION` | SOS GPS coordinates | During SOS setup |
| `INTERNET` | LLM API calls | Always (no prompt needed) |

**Permission UX:** Request permissions contextually (when the feature is first used), not all at once. Explain in simple language why each permission is needed, in the user's language.

## 10. Data & Privacy

| Aspect | Approach |
|--------|----------|
| **Storage** | All data stored locally on device (SQLite). No cloud sync in v1. |
| **LLM data** | Only transcribed text + contact names sent to Z.AI API. No phone numbers sent to LLM (resolved locally). |
| **API key** | Stored in device secure storage (expo-secure-store). |
| **No analytics** | Zero telemetry in v1. Seniors' data stays on their phone. |
| **No account** | No sign-up, no login. App works immediately after setup. |

## 11. Offline Behavior

| Component | Offline Capability |
|-----------|--------------------|
| **STT** | Works offline (Android on-device models) |
| **TTS** | Works offline (Android on-device engine) |
| **LLM** | ❌ Requires internet. Show: "Internet nahi hai. Aap seedha call kar sakte hain." (No internet. You can directly call.) |
| **Calls** | Works offline (cellular) |
| **SMS** | Works offline (cellular) |
| **SOS** | Partially works — call + SMS work, GPS may be degraded |
| **Fallback** | When LLM is unavailable, show favorite contacts grid for direct tap-to-call. Voice features disabled with clear message. |

## 12. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Voice response latency** | < 3 seconds from end of speech to Aasra's spoken response |
| **App launch time** | < 2 seconds to interactive home screen |
| **SOS trigger to action** | < 5 seconds from trigger to call + SMS sent |
| **Battery impact** | < 5% per hour of active use (no background listening in v1) |
| **Min Android version** | Android 8.0 (API 26) — covers 95%+ of Indian Android devices |
| **APK size** | < 30 MB |
| **Accessibility** | TalkBack compatible, high contrast, large touch targets |

## 13. Release Plan

### v1.0 — MVP (Target: 8 weeks)

| Week | Milestone |
|------|-----------|
| 1-2 | Project setup, voice pipeline (STT + TTS), basic UI shell |
| 3-4 | LLM integration, intent parsing, contact management |
| 5-6 | Call, Text, SOS features complete |
| 7 | End-to-end testing with real seniors, bug fixes |
| 8 | Polish, performance optimization, APK release (sideload) |

### v1.1 — Enhancements
- WhatsApp message sending (via accessibility service or WhatsApp Business API)
- Always-listening mode ("Hey Aasra" wake word)
- Call history and message history voice browsing
- Caregiver remote monitoring (missed SOS alerts)

### v2.0 — iOS + Cloud
- iOS build via Expo/React Native
- Cloud contact sync (optional, for caregiver management)
- Multiple language support (Tamil, Telugu, Bengali)
- On-device LLM option (for full offline capability)

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| **Task completion rate** | > 85% of voice commands successfully executed on first attempt |
| **SOS reliability** | 100% — SOS must never fail |
| **Senior satisfaction** | Qualitative: "I can use this without help" from 4/5 test users |
| **Daily active usage** | Senior uses app for ≥ 2 calls/day without caregiver assistance |
| **Setup time** | Caregiver can set up the app in < 10 minutes |

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| STT accuracy for elderly Hindi speakers | Core feature broken | Test with 10+ seniors during development. Tune STT language models. Fallback to Google Cloud STT. |
| LLM latency on slow networks | Poor UX, seniors lose patience | Stream responses. Show visual feedback immediately. Cache common intents locally. |
| Z.AI API downtime | App unusable for voice features | Graceful fallback to tap-to-call grid. Queue messages for retry. |
| Seniors forget how to use the app | Abandonment | On-device tutorial (voice-guided). Periodic gentle reminders: "Aap mujhse kuch bhi bol sakte hain" |
| Accidental SOS triggers | False alarms, alert fatigue | Confirmation prompt + 3-second long-press. Cooldown period between SOS triggers. |
| Privacy concerns (voice data to cloud) | Trust issues | Transparent: only text sent to LLM, not audio. No data stored on servers. |

## 16. Open Questions

1. **WhatsApp integration in v1?** — WhatsApp doesn't have a public send-message API. Options: Accessibility service (fragile), WhatsApp Business API (requires business account), or defer to v1.1. **Decision: Defer to v1.1. SMS only for v1.**

2. **Wake word detection?** — "Hey Aasra" always-listening requires background audio processing and significant battery. **Decision: Defer to v1.1. Tap-to-talk for v1.**

3. **Multiple seniors per device?** — Some households share a phone. **Decision: Single user for v1. Multi-profile in v2.**

4. **Monetization?** — Free for now. LLM API costs are the primary expense. Consider: caregiver premium features, sponsored by NGOs/government senior programs. **Decision: Free. Revisit after 1000 users.**

---

## Appendix A: Project Structure

```
AasraAI/
├── docs/
│   └── prd.md                    # This file
├── app/                           # Expo Router screens
│   ├── index.tsx                  # Home screen
│   ├── conversation.tsx           # Voice interaction overlay
│   ├── confirmation.tsx           # Action confirmation
│   └── settings/
│       ├── index.tsx              # Settings hub (PIN-protected)
│       ├── contacts.tsx           # Contact management
│       └── sos.tsx                # SOS configuration
├── src/
│   ├── services/
│   │   ├── llm.service.ts        # Z.AI API integration
│   │   ├── stt.service.ts        # Speech-to-Text wrapper
│   │   ├── tts.service.ts        # Text-to-Speech wrapper
│   │   ├── call.service.ts       # Phone call execution
│   │   ├── sms.service.ts        # SMS sending/reading
│   │   ├── sos.service.ts        # SOS orchestration
│   │   └── contacts.service.ts   # Contact CRUD + fuzzy matching
│   ├── stores/
│   │   ├── conversation.store.ts # Voice interaction state
│   │   ├── contacts.store.ts     # Contact list state
│   │   └── settings.store.ts     # App settings state
│   ├── db/
│   │   ├── schema.ts             # SQLite schema
│   │   └── migrations.ts         # DB migrations
│   ├── utils/
│   │   ├── intent-parser.ts      # LLM response parsing
│   │   └── fuzzy-match.ts        # Contact name matching
│   └── constants/
│       ├── prompts.ts             # LLM system prompts
│       └── theme.ts               # Colors, fonts, sizes
├── assets/                        # Icons, images, sounds
├── app.json                       # Expo config
├── package.json
├── tsconfig.json
└── .env                           # API keys (gitignored)
```

## Appendix B: LLM Request/Response Examples

### Example 1: Make a call (Hindi)

**User says:** "Raju ko phone lagao"

**LLM Request:**
```json
{
  "model": "glm-5.1",
  "messages": [
    {"role": "system", "content": "<system prompt with contacts>"},
    {"role": "user", "content": "Raju ko phone lagao"}
  ],
  "temperature": 0.3,
  "max_tokens": 256
}
```

**LLM Response:**
```json
{
  "intent": "CALL",
  "contact": "Raju Sharma",
  "contact_phone": "+919876543210",
  "message_body": null,
  "spoken_response": "Kya main Raju Sharma ko call karoon?",
  "needs_confirmation": true,
  "language": "hi"
}
```

### Example 2: Send a text (Hinglish)

**User says:** "Beti ko message bhejo ki main theek hoon"

**LLM Response:**
```json
{
  "intent": "TEXT",
  "contact": "Priya (Beti)",
  "contact_phone": "+919876543211",
  "message_body": "Main theek hoon",
  "spoken_response": "Priya ko message bhej rahi hoon: 'Main theek hoon'. Bhej doon?",
  "needs_confirmation": true,
  "language": "hi"
}
```

### Example 3: SOS (English)

**User says:** "Help! I fell down!"

**LLM Response:**
```json
{
  "intent": "SOS",
  "contact": null,
  "contact_phone": null,
  "message_body": null,
  "spoken_response": "I'm sending an emergency alert to your family right now. Stay calm.",
  "needs_confirmation": false,
  "language": "en"
}
```

### Example 4: Ambiguous contact

**User says:** "Call Raju"

**LLM Response (multiple matches):**
```json
{
  "intent": "CALL",
  "contact": null,
  "contact_phone": null,
  "message_body": null,
  "spoken_response": "Aapki list mein do Raju hain. Ek: Raju Sharma, doosra: Raju Verma. Kaunsa?",
  "needs_confirmation": false,
  "language": "hi"
}
```

---

*Last updated: 2026-04-14*
*Author: Gopal Kumar*
*Status: Draft — Ready for review*
