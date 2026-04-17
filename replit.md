# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Includes a Discord bot (Aishivex) and a backend API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Discord Bot — Aishivex v3 (`artifacts/discord-bot`)

Ultra aesthetic gaming community bot. discord.js v14. **35 slash commands**.

### Features

**꒰🤖 AI Chat**
- `/ai <soru>` or `@Aishivex <mention>` — Gemini 2.5 Flash (Replit AI Integrations)

**꒰🏆 XP & Leveling**
- Chat XP, voice XP, level-up roles (Aktif Üye @5, Sadık Üye @15)
- `/level`, `/leaderboard`

**꒰🎭 Reaction Roles**
- `/setup-roles` → 🎯 Valorant, 🔫 CS2, ⛏️ Minecraft, 👑 LoL, 🚗 GTA RP, 🎵 Müzik Sever

**꒰🎵 Music (FFmpeg Fixed)**
- `/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/volume`, `/nowplaying`, `/queue`
- Uses `ffmpeg-static` + `StreamType.Arbitrary` — no silent audio bug
- FFmpeg path set at startup via `createRequire` in both index.js and musicManager.js

**꒰🔧 Full Moderation (14 commands)**
- `/ban`, `/unban`, `/kick` — permanent actions
- `/warn`, `/warnings`, `/clearwarns` — 3-strike auto-mute (30 min)
- `/mute`, `/unmute` — Discord timeout
- `/clear` — bulk delete up to 100 messages
- `/slowmode` — 0–6h slowmode
- `/lock`, `/unlock` — channel permissions
- `/nickname` — change/reset member nickname
- `/purge` — delete specific user's messages

**꒰📊 General (9 commands)**
- `/ping`, `/botinfo`, `/serverinfo`, `/userinfo`, `/avatar`
- `/8ball`, `/coinflip`, `/poll`, `/announce`

**꒰🌸 Welcome & Auto-Role**
- Aesthetic embed in #hoş-geldin on member join
- Auto-assigns "Yeni Üye" role on join

**꒰🔄 Keep-alive**
- HTTP server on PORT for Replit uptime

### Prefix: `!` | Slash: `/` | AI: `@Aishivex`

### Required Secrets
- `TOKEN` — Discord bot token
- `AI_INTEGRATIONS_GEMINI_BASE_URL` + `AI_INTEGRATIONS_GEMINI_API_KEY` — auto-set by Replit AI Integrations

### Data Files
- `src/data/xp.json` — XP & level data per guild/user
- `src/data/reactionRoles.json` — reaction role message IDs per guild
- `src/data/warnings.json` — warning records per guild/user

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/discord-bot run dev` — run Discord bot

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
