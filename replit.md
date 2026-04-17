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

## Discord Bot — Aishivex (`artifacts/discord-bot`)

Ultra aesthetic gaming community bot. discord.js v14.

### Features
- **AI Chat** — `/ai <soru>` or `@Aishivex` mention, powered by Gemini 2.5 Flash (Replit AI Integrations)
- **XP & Leveling** — chat + voice XP, level-up roles (Aktif Üye @5, Sadık Üye @15), `/level`, `/leaderboard`
- **Reaction Roles** — `/setup-roles` in #rol-al: 🎯 Valorant, 🔫 CS2, ⛏️ Minecraft, 👑 LoL, 🚗 GTA RP, 🎵 Müzik Sever
- **Music** — `/play`, `/skip`, `/stop`, `/queue` via @discordjs/voice + play-dl
- **Moderation** — `/mute`, `/unmute`, `/clear` (staff only)
- **Welcome** — aesthetic embed in #hoş-geldin on member join
- **Keep-alive** — HTTP server on PORT for Replit uptime

### Prefix: `!` | Slash: `/`

### Required Secrets
- `TOKEN` — Discord bot token
- `AI_INTEGRATIONS_GEMINI_BASE_URL` + `AI_INTEGRATIONS_GEMINI_API_KEY` — auto-set by Replit AI Integrations

### Data Files
- `src/data/xp.json` — XP & level data per guild/user
- `src/data/reactionRoles.json` — reaction role message IDs per guild

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/discord-bot run dev` — run Discord bot

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
