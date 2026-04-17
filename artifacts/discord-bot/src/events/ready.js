// ─────────────────────────────────────────────────────────────
// Ready Event — Aishivex
// Tüm slash komutlarını global olarak deploy et
// ─────────────────────────────────────────────────────────────

import { REST, Routes, ActivityType } from "discord.js";

// ── Komut verileri import ─────────────────────────────────
import { data as aiData }                                from "../commands/ai.js";
import { data as levelData, lbData }                    from "../commands/level.js";
import { data as setupRolesData }                       from "../commands/setupRoles.js";
import {
  pingData, botinfoData, serverinfoData, userinfoData,
  avatarData, eightBallData, coinflipData, pollData, announceData,
}                                                        from "../commands/general.js";
import {
  banData, unbanData, kickData, warnData, warningsData, clearwarnsData,
  muteData, unmuteData, clearData, slowmodeData,
  lockData, unlockData, nicknameData, purgeData,
}                                                        from "../commands/mod.js";
import {
  playData, skipData, stopData, pauseData, resumeData,
  volumeData, nowplayingData, queueData,
}                                                        from "../commands/music.js";
import {
  automodData, lockdownData, unlockdownData, raidstatusData,
}                                                        from "../commands/protection.js";

export const name = "clientReady";
export const once = true;

export async function execute(client) {
  console.log(`✦ Aishivex online: ${client.user.tag}`);
  console.log(`✦ ${client.guilds.cache.size} sunucuda aktif`);

  // Aktivite
  client.user.setActivity("꒰🛡️ sunucunu koruyor ✦", { type: ActivityType.Watching });

  // Tüm slash komutları
  const commands = [
    // AI
    aiData,
    // General
    pingData, botinfoData, serverinfoData, userinfoData,
    avatarData, eightBallData, coinflipData, pollData, announceData,
    // Level
    levelData, lbData,
    // Reaction Roles
    setupRolesData,
    // Moderation
    banData, unbanData, kickData,
    warnData, warningsData, clearwarnsData,
    muteData, unmuteData,
    clearData, slowmodeData,
    lockData, unlockData,
    nicknameData, purgeData,
    // Music
    playData, skipData, stopData,
    pauseData, resumeData,
    volumeData, nowplayingData, queueData,
    // Protection
    automodData, lockdownData, unlockdownData, raidstatusData,
  ].map((c) => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`✦ ${commands.length} slash komutu deploy edildi ✓`);
  } catch (err) {
    console.error("Slash deploy hatası:", err.message);
  }
}
