# 🎙️ Aasra AI

> **"Bolo, aur ho jaayega."** — Say it, and it's done.

**Aasra** (आसरा) — Hindi for "support" / "shelter". An AI-powered **voice-first** assistant that helps seniors (60+) stay connected with their loved ones.

Built with ❤️ for India and the Indian diaspora.

---

## 🧓 The Problem

Seniors struggle with smartphones. Small text, complex UIs, multi-step workflows — basic tasks like calling or texting become dependent on family members. Existing "senior launchers" simplify the UI but still require reading, tapping, and navigating.

**Seniors don't need a simplified graphical interface. They need a conversational one.**

## ✨ What It Does

| Feature | How It Works |
|---------|-------------|
| **📞 Voice Calls** | *"Raju ko phone lagao"* → Aasra calls Raju |
| **💬 Text Messages** | *"Beti ko message bhejo — main theek hoon"* → SMS sent |
| **🚨 SOS Emergency** | *"Madad!"* or press SOS button → Calls + SMS with GPS location to emergency contacts |
| **🗣️ Bilingual** | Hindi, English, and Hinglish — auto-detected |
| **🤖 AI-Powered** | LLM understands intent, confirms, and executes |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native (Expo SDK 53) |
| **Language** | TypeScript |
| **Navigation** | Expo Router |
| **State** | Zustand |
| **Database** | expo-sqlite (100% local, no cloud) |
| **Voice** | expo-speech-recognition (STT) + expo-speech (TTS) |
| **AI/LLM** | Z.AI GLM-5.1 (streaming, OpenAI-compatible) |
| **Build** | EAS Build |

## 📱 Screenshots

> *Coming soon — MVP in development*

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android device (for telephony/SMS features)

### Setup

```bash
# Clone the repo
git clone https://github.com/allStuffData/AasraAI.git
cd AasraAI

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your Z.AI API key to .env

# Start development server
npx expo start
```

Scan the QR code with **Expo Go** on your Android device.

### Environment Variables

| Variable | Description |
|----------|------------|
| `EXPO_PUBLIC_ZAI_API_KEY` | Z.AI API key for LLM |
| `EXPO_PUBLIC_ZAI_BASE_URL` | Z.AI API base URL |

## 📂 Project Structure

```
AasraAI/
├── app/                    # Expo Router screens
│   ├── index.tsx           # Home (Talk button, SOS, favorites)
│   ├── conversation.tsx    # Voice interaction overlay
│   ├── confirmation.tsx    # Action confirmation
│   └── settings/           # PIN-protected caregiver settings
├── src/
│   ├── services/           # Business logic (LLM, STT, TTS, Call, SMS, SOS)
│   ├── stores/             # Zustand state management
│   ├── db/                 # SQLite schema & migrations
│   ├── utils/              # Intent parser, fuzzy matching
│   └── constants/          # Theme, prompts
├── docs/
│   ├── prd.md              # Full Product Requirements Document
│   └── implementation_checklist.md
├── CLAUDE.md               # AI agent context
├── AGENTS.md               # Agent instructions
└── README.md
```

## 🗺️ Roadmap

### v1.0 — MVP (Current)
- [x] Voice pipeline (STT + TTS)
- [x] LLM intent parsing (Z.AI GLM)
- [x] Contact management with nicknames
- [x] Phone calling via voice
- [x] SMS sending + reading
- [x] SOS emergency alerts with GPS
- [x] Offline fallback
- [ ] End-to-end testing on real devices
- [ ] APK release

### v1.1 — Enhancements
- WhatsApp message sending
- Always-listening wake word ("Hey Aasra")
- Call & message history browsing
- Caregiver remote monitoring

### v2.0 — Scale
- iOS support
- Cloud contact sync
- More languages (Tamil, Telugu, Bengali)
- On-device LLM for full offline capability

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Gopal Kumar**
- UC Berkeley MEng (IEOR, FinTech)
- ex-Microsoft, ex-JPMorgan
- [LinkedIn](https://linkedin.com/in/gopalkumar)

---

<div align="center">
  <i>Made with ❤️ for the people who taught us how to speak.</i>
</div>
