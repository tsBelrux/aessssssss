// ─────────────────────────────────────────────────────────────
// Ready Event — Aishivex
// Tüm slash komutlarını deploy et
// ─────────────────────────────────────────────────────────────

import { REST, Routes, ActivityType } from "discord.js";

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
import {
  rpsData, loveData, shipData, mockData, reverseData,
  diceData, chooseData, triviaData, kelimeData,
  factData, rateData, bumpdurumData,
}                                                        from "../commands/fun.js";

export const name = "clientReady";
export const once = true;

export async function execute(client) {
  console.log(`✦ Aishivex online: ${client.user.tag}`);
  console.log(`✦ ${client.guilds.cache.size} sunucuda aktif`);

  // Dönen aktiviteler
  const activities = [
    { name: "꒰🛡️ sunucunu koruyor ✦", type: ActivityType.Watching },
    { name: "꒰🎵 müzik çalıyor ✦",    type: ActivityType.Listening },
    { name: "꒰🎮 oyun oynuyor ✦",      type: ActivityType.Playing   },
  ];
  let i = 0;
  const rotate = () => {
    const a = activities[i % activities.length];
    client.user.setActivity(a.name, { type: a.type });
    i++;
  };
  rotate();
  setInterval(rotate, 30_000);

  // Tüm slash komutları
  const commands = [
    aiData,
    pingData, botinfoData, serverinfoData, userinfoData,
    avatarData, eightBallData, coinflipData, pollData, announceData,
    levelData, lbData,
    setupRolesData,
    banData, unbanData, kickData,
    warnData, warningsData, clearwarnsData,
    muteData, unmuteData,
    clearData, slowmodeData,
    lockData, unlockData,
    nicknameData, purgeData,
    playData, skipData, stopData,
    pauseData, resumeData,
    volumeData, nowplayingData, queueData,
    automodData, lockdownData, unlockdownData, raidstatusData,
    rpsData, loveData, shipData, mockData, reverseData,
    diceData, chooseData, triviaData, kelimeData,
    factData, rateData, bumpdurumData,
  ].map((c) => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`✦ ${commands.length} slash komutu deploy edildi ✓`);
  } catch (err) {
    console.error("Slash deploy hatası:", err.message);
  }
}
