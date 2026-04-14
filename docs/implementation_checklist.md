# AasraAI — Implementation Checklist

## Phase 1: Project Setup & Voice Pipeline (Weeks 1-2)

- [ ] **1.1** Expo project scaffold (TypeScript, Expo Router, Zustand, expo-sqlite)
- [ ] **1.2** Project structure as defined in PRD Appendix A
- [ ] **1.3** Theme & constants (colors, fonts, sizes per PRD §7.3)
- [ ] **1.4** SQLite schema & migrations (contacts, call_log, settings, chat_history)
- [ ] **1.5** STT service wrapper (expo-speech-recognition)
- [ ] **1.6** TTS service wrapper (expo-speech)
- [ ] **1.7** Home screen UI (Talk button, SOS button, favorites grid, status bar)
- [ ] **1.8** Conversation screen UI (waveform, transcription, response, cancel)

## Phase 2: LLM Integration & Contact Management (Weeks 3-4)

- [ ] **2.1** LLM service (Z.AI API, streaming, OpenAI-compatible format)
- [ ] **2.2** System prompt + intent parser (structured JSON responses)
- [ ] **2.3** Conversation store (rolling 5-turn context, inactivity timeout)
- [ ] **2.4** Contact service (CRUD, fuzzy matching, nicknames/aliases)
- [ ] **2.5** Contacts store (Zustand)
- [ ] **2.6** Settings store (language, voice speed, API key)
- [ ] **2.7** Settings screens (PIN-protected hub, contacts mgmt, SOS config)
- [ ] **2.8** Contact import from phone (expo-contacts)

## Phase 3: Core Features — Call, Text, SOS (Weeks 5-6)

- [ ] **3.1** Call service (dialer intent via expo-linking)
- [ ] **3.2** SMS service (send + read via expo-sms)
- [ ] **3.3** SOS service (call + SMS + GPS location)
- [ ] **3.4** Confirmation screen (Yes/No, auto-timeout 10s)
- [ ] **3.5** Call history logging (SQLite)
- [ ] **3.6** Offline fallback (tap-to-call grid when no internet)
- [ ] **3.7** Permission handling (contextual, bilingual explanations)

## Phase 4: Testing & Polish (Weeks 7-8)

- [ ] **4.1** End-to-end voice flow testing
- [ ] **4.2** SOS reliability testing
- [ ] **4.3** Accessibility audit (TalkBack, high contrast)
- [ ] **4.4** Performance optimization (latency, battery)
- [ ] **4.5** APK build via EAS
- [ ] **4.6** Bug fixes & polish

---

*Last updated: 2026-04-14*
*Status: In Progress — Phase 1 started*
