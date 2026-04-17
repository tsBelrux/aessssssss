// ─────────────────────────────────────────────────────────────
// Ready Event — Aishivex
// Bot hazır olduğunda slash komutları global deploy et
// ─────────────────────────────────────────────────────────────

import { REST, Routes, ActivityType } from "discord.js";
import { data as aiData }                              from "../commands/ai.js";
import { data as levelData, lbData }                   from "../commands/level.js";
import { data as setupRolesData }                      from "../commands/setupRoles.js";
import { playData, skipData, stopData, queueData }     from "../commands/music.js";
import { muteData, unmuteData, clearData }             from "../commands/mod.js";

export const name = "clientReady";
export const once = true;

export async function execute(client) {
  console.log(`✦ Aishivex online: ${client.user.tag}`);
  console.log(`✦ ${client.guilds.cache.size} sunucuda aktif`);

  // Aktivite ayarla
  client.user.setActivity("꒰🌸 aesthetic gaming", { type: ActivityType.Watching });

  // Slash komutlarını hazırla
  const commands = [
    aiData,
    levelData,
    lbData,
    setupRolesData,
    playData,
    skipData,
    stopData,
    queueData,
    muteData,
    unmuteData,
    clearData,
  ].map((c) => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`✦ ${commands.length} slash komutu deploy edildi ✓`);
  } catch (err) {
    console.error("Slash komut deploy hatası:", err.message);
  }
}
