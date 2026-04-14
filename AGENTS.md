# AGENTS.md — AasraAI Agent Instructions

> This file provides instructions for AI coding agents (Claude Code, Codex, Cursor, etc.) working on this project.
> For full project context, see `CLAUDE.md`.

## Quick Start

1. Read `CLAUDE.md` for full project context
2. Read `docs/prd.md` for product requirements
3. Check `docs/implementation_checklist.md` for current progress

## Agent Rules

### Always Do
- Use TypeScript strict mode — no `any` types
- Follow the existing service/store pattern (one service per domain)
- Keep UI components senior-friendly: 64dp+ touch targets, 20sp+ font, high contrast
- Write bilingual strings (Hindi + English) for all user-facing text
- Strip markdown code fences from LLM responses before JSON parsing
- Test LLM integration against the real Z.AI endpoint (key in `.env`)
- Update `docs/implementation_checklist.md` after completing checkpoints

### Never Do
- Don't send phone numbers to the LLM — resolve contacts locally
- Don't add text input fields — this is a voice-first app, no typing
- Don't add cloud sync, accounts, or analytics in v1
- Don't bypass the confirmation step for destructive actions (except SOS long-press)
- Don't use outlined icons — filled only
- Don't add always-listening/wake-word features (v1.1 scope)
- Don't modify `.env` or commit API keys

### Code Style
- Services: plain TypeScript modules with named exports (no classes)
- Stores: Zustand with typed state + actions
- Screens: functional React components with hooks
- Path aliases: `@/` maps to `src/`
- Import order: React → React Native → third-party → `@/` local

### Architecture

```
Voice Input → STT → LLM Intent Parse → Confirmation → Action Executor
                                                                ↓
                                                    Call / SMS / SOS
```

- **STT/TTS**: Use expo-speech-recognition and expo-speech
- **LLM**: Z.AI GLM-5.1 via OpenAI-compatible chat completions (streaming)
- **Actions**: Each action (call, sms, sos) is a separate service
- **Data**: All local via expo-sqlite. No remote storage in v1.

### When Making Changes

1. Check existing patterns before inventing new ones
2. Update the relevant store if adding new state
3. Update schema.ts + migrations.ts if adding DB tables/columns
4. Keep the conversation store's 5-turn rolling window
5. Maintain bilingual support in all new user-facing strings

## Useful Commands

```bash
npm install          # Install deps
npx expo start       # Dev server
npx expo run:android # Run on connected Android device
npm run typecheck    # TypeScript check
```

## Status

See `docs/implementation_checklist.md` for phase-by-phase progress.
