// ============================================================
// Ultra Aesthetic Soft Gaming Community Discord Bot
// Built with discord.js v14
// ============================================================

import {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  Colors,
} from "discord.js";

// ─────────────────────────────────────────────────────────────
// Client setup with all required intents
// ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

// ─────────────────────────────────────────────────────────────
// Role definitions
// ─────────────────────────────────────────────────────────────
const ROLES = [
  { name: "Kurucu",           color: 0xff99cc, hoist: true, isAdmin: true  },
  { name: "Admin",            color: 0xff6699, hoist: true                  },
  { name: "Moderatör",        color: 0x99ccff, hoist: true                  },
  { name: "Oyun Lideri",      color: 0xcc99ff, hoist: true                  },
  { name: "Aktif Üye",        color: 0xaaffcc, hoist: true                  },
  { name: "Sadık Üye",        color: 0xffdd99, hoist: true                  },
  { name: "Yeni Üye",         color: 0xcccccc, hoist: true                  },
  { name: "Sus",              color: 0x666666                               },
  { name: "Valorant",         color: 0xff6699                               },
  { name: "CS2",              color: 0x99aaff                               },
  { name: "Minecraft",        color: 0x99ff99                               },
  { name: "League of Legends",color: 0xcc99ff                               },
  { name: "GTA RP",           color: 0xff99cc                               },
  { name: "Müzik Sever",      color: 0xff99dd                               },
];

// ─────────────────────────────────────────────────────────────
// Channel / category definitions
// ─────────────────────────────────────────────────────────────
const STRUCTURE = [
  {
    category: "꒰📌・Bilgilendirme",
    channels: [
      { name: "✦・kurallar",           type: ChannelType.GuildText,  topic: "Sunucu kuralları burada ✦" },
      { name: "꒰📢・duyurular",        type: ChannelType.GuildText,  topic: "Sunucu duyuruları 📢"      },
      { name: "👋・hoş-geldin",         type: ChannelType.GuildText,  topic: "Yeni üyeleri burada karşılıyoruz 🌸" },
      { name: "🎨・rol-al",             type: ChannelType.GuildText,  topic: "Rollerini buradan seç 🎨"  },
      { name: "𓂃・sunucu-bilgileri",   type: ChannelType.GuildText,  topic: "Sunucu hakkında bilgiler 𓂃" },
    ],
  },
  {
    category: "꒰💬・Topluluk Sohbet",
    channels: [
      { name: "˚・genel-sohbet",        type: ChannelType.GuildText,  topic: "Genel sohbet alanı ˚✧"    },
      { name: "✿・memeler",             type: ChannelType.GuildText,  topic: "Meme paylaş, gül ✿"        },
      { name: "🗣️・off-topic",          type: ChannelType.GuildText,  topic: "Her şey konuşulur 🗣️"      },
      { name: "📸・foto-selfie",         type: ChannelType.GuildText,  topic: "Fotoğraf ve selfie paylaş 📸" },
      { name: "💡・oyun-tavsiyeleri",   type: ChannelType.GuildText,  topic: "Oyun önerilerin burada 💡"  },
    ],
  },
  {
    category: "꒰🎮・Oyun & LFG",
    channels: [
      { name: "🔍・lfg-look-for-group",  type: ChannelType.GuildText,  topic: "Takım ara, takım bul 🔍"  },
      { name: "✦・valorant-lfg",         type: ChannelType.GuildText,  topic: "Valorant takım bul ✦"      },
      { name: "🎯・cs2-lfg",             type: ChannelType.GuildText,  topic: "CS2 takım bul 🎯"          },
      { name: "⛏️・minecraft-lfg",       type: ChannelType.GuildText,  topic: "Minecraft oyun arkadaşı bul ⛏️" },
      { name: "🎥・clips-highlights",    type: ChannelType.GuildText,  topic: "En güzel anları paylaş 🎥" },
    ],
  },
  {
    category: "꒰🏆・Etkinlik & Rekabet",
    channels: [
      { name: "🔥・etkinlikler",          type: ChannelType.GuildText,  topic: "Etkinlik duyuruları 🔥"    },
      { name: "🏅・turnuva-duyuruları",   type: ChannelType.GuildText,  topic: "Turnuva bilgileri 🏅"      },
      { name: "📊・leaderboard",          type: ChannelType.GuildText,  topic: "Sıralama tablosu 📊"       },
    ],
  },
  {
    category: "꒰🎉・Ekstra",
    channels: [
      { name: "🎵・müzik-istek",          type: ChannelType.GuildText,  topic: "Müzik isteklerini buraya yaz 🎵" },
      { name: "🤖・ai-chat",             type: ChannelType.GuildText,  topic: "AI ile sohbet 🤖"           },
    ],
  },
  {
    category: "꒰🔊・Ses Kanalları",
    channels: [
      { name: "🛋️ Lounge",              type: ChannelType.GuildVoice                                       },
      { name: "🎤 Genel Ses 1",          type: ChannelType.GuildVoice                                       },
      { name: "🎮 Oyun Odası 1",         type: ChannelType.GuildVoice                                       },
      { name: "🎮 Oyun Odası 2",         type: ChannelType.GuildVoice                                       },
      { name: "📡 Streaming Odası",      type: ChannelType.GuildVoice                                       },
      { name: "💤 AFK",                  type: ChannelType.GuildVoice                                       },
    ],
  },
  {
    // Staff-only category — only Admin+ can see
    category: "꒰👮・Staff Only",
    staffOnly: true,
    channels: [
      { name: "🔒・staff-chat",          type: ChannelType.GuildText,  topic: "Staff konuşma kanalı 🔒"   },
      { name: "📋・mod-log",             type: ChannelType.GuildText,  topic: "Moderasyon kayıtları 📋"    },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Helper: sleep
// ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────
// Helper: safely delete an item with retry
// ─────────────────────────────────────────────────────────────
async function safeDelete(item) {
  try {
    await item.delete();
  } catch (err) {
    // Ignore permission / already deleted errors
    if (err.code !== 10003 && err.code !== 10008 && err.code !== 50074) {
      console.error(`Failed to delete ${item.name ?? item.id}:`, err.message);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// .bomb command handler
// ─────────────────────────────────────────────────────────────
async function runBomb(message) {
  const guild = message.guild;

  // ── Permission check: user must have Administrator ──────
  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ Bu komutu kullanmak için **Administrator** yetkisine ihtiyacın var.");
  }

  // ── Acknowledge start ───────────────────────────────────
  await message.reply("✦ Sunucu yeniden kuruluyor... Lütfen bekle 🌸");

  // ══════════════════════════════════════════════════════
  // STEP 1 — Delete all channels and categories
  // ══════════════════════════════════════════════════════
  const channels = await guild.channels.fetch();

  // Delete text/voice/stage channels first, then categories
  const categories = [];
  for (const [, ch] of channels) {
    if (!ch) continue;
    if (ch.type === ChannelType.GuildCategory) {
      categories.push(ch);
    } else {
      await safeDelete(ch);
      await sleep(300); // rate-limit buffer
    }
  }
  for (const cat of categories) {
    await safeDelete(cat);
    await sleep(300);
  }

  // ══════════════════════════════════════════════════════
  // STEP 2 — Delete all roles except @everyone
  // ══════════════════════════════════════════════════════
  const roles = await guild.roles.fetch();
  for (const [, role] of roles) {
    if (role.name === "@everyone" || role.managed) continue; // keep @everyone & bot-managed roles
    try {
      await role.delete();
      await sleep(300);
    } catch (err) {
      console.error(`Could not delete role "${role.name}":`, err.message);
    }
  }

  // ══════════════════════════════════════════════════════
  // STEP 3 — Create roles
  // ══════════════════════════════════════════════════════
  const createdRoles = {};

  for (const roleDef of ROLES) {
    const permissions = [];

    if (roleDef.name === "Kurucu") {
      permissions.push(PermissionFlagsBits.Administrator);
    } else if (roleDef.name === "Admin") {
      permissions.push(
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
      );
    } else if (roleDef.name === "Moderatör") {
      permissions.push(
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
        PermissionFlagsBits.MoveMembers,
        PermissionFlagsBits.ModerateMembers,
      );
    } else if (roleDef.name === "Sus") {
      // "Sus" role — no send messages permission (used to mute members)
      permissions.push(
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
      );
    } else {
      // All regular member roles
      permissions.push(
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.UseApplicationCommands,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      );
    }

    try {
      const role = await guild.roles.create({
        name: roleDef.name,
        color: roleDef.color,
        hoist: roleDef.hoist ?? false,
        mentionable: false,
        permissions,
        reason: "Ultra Aesthetic Server Setup — .bomb",
      });
      createdRoles[roleDef.name] = role;
      await sleep(300);
    } catch (err) {
      console.error(`Could not create role "${roleDef.name}":`, err.message);
    }
  }

  // Collect Admin-level roles (Kurucu + Admin) for permission helpers
  const staffRoles = [
    createdRoles["Kurucu"],
    createdRoles["Admin"],
    createdRoles["Moderatör"],
  ].filter(Boolean);

  const adminRoles = [createdRoles["Kurucu"], createdRoles["Admin"]].filter(Boolean);

  // ══════════════════════════════════════════════════════
  // STEP 4 — Create categories & channels
  // ══════════════════════════════════════════════════════
  let hosGeldinChannel = null; // reference to welcome channel for later use

  for (const section of STRUCTURE) {
    // ── Create category ────────────────────────────────
    const categoryPermissions = [];

    if (section.staffOnly) {
      // Deny @everyone, allow staff roles
      categoryPermissions.push({
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      });
      for (const role of staffRoles) {
        categoryPermissions.push({
          id: role,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        });
      }
    } else {
      // Public — everyone can view
      categoryPermissions.push({
        id: guild.roles.everyone,
        allow: [PermissionFlagsBits.ViewChannel],
      });
    }

    let categoryChannel;
    try {
      categoryChannel = await guild.channels.create({
        name: section.category,
        type: ChannelType.GuildCategory,
        permissionOverwrites: categoryPermissions,
        reason: "Ultra Aesthetic Server Setup — .bomb",
      });
      await sleep(300);
    } catch (err) {
      console.error(`Could not create category "${section.category}":`, err.message);
      continue;
    }

    // ── Create channels inside category ───────────────
    for (const chDef of section.channels) {
      const channelOptions = {
        name: chDef.name,
        type: chDef.type,
        parent: categoryChannel,
        reason: "Ultra Aesthetic Server Setup — .bomb",
      };

      if (chDef.topic) channelOptions.topic = chDef.topic;

      // Special permissions for specific channels
      const channelPerms = [];

      if (section.staffOnly) {
        // Staff-only channels: deny everyone, allow staff
        channelPerms.push({
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        });
        for (const role of staffRoles) {
          channelPerms.push({
            id: role,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          });
        }
      } else if (
        chDef.name.includes("kurallar") ||
        chDef.name.includes("duyurular") ||
        chDef.name.includes("sunucu-bilgileri")
      ) {
        // Read-only for regular members, staff can post
        channelPerms.push({
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages],
        });
        for (const role of adminRoles) {
          channelPerms.push({
            id: role,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages],
          });
        }
      } else if (chDef.name.includes("hoş-geldin") || chDef.name.includes("hos-geldin")) {
        // Welcome channel: everyone can view, only bot/staff posts
        channelPerms.push({
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages],
        });
        for (const role of staffRoles) {
          channelPerms.push({
            id: role,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages],
          });
        }
        // bot itself needs to send — handled by bot's own permissions
      } else if (chDef.name.includes("leaderboard") || chDef.name.includes("turnuva-duyuru")) {
        // Leaderboard / tournament announcements: read-only for members
        channelPerms.push({
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages],
        });
        for (const role of staffRoles) {
          channelPerms.push({
            id: role,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages],
          });
        }
      }

      if (channelPerms.length > 0) channelOptions.permissionOverwrites = channelPerms;

      try {
        const ch = await guild.channels.create(channelOptions);
        await sleep(300);

        // Save reference to hoş-geldin channel
        if (chDef.name.includes("hoş-geldin") || chDef.name.includes("hos-geldin")) {
          hosGeldinChannel = ch;
        }
      } catch (err) {
        console.error(`Could not create channel "${chDef.name}":`, err.message);
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // STEP 5 — Send aesthetic success message
  // ══════════════════════════════════════════════════════
  const successEmbed = new EmbedBuilder()
    .setColor(0xff99cc)
    .setTitle("✦ ꒰🌸・Ultra Aesthetic Sunucu Kuruldu!")
    .setDescription(
      "Her şey şık ve hazır ✨\n\n" +
      "꒰🎨 **Roller** oluşturuldu\n" +
      "꒰📌 **Kategoriler** ve **kanallar** hazır\n" +
      "꒰🔒 **Staff kanalları** gizli ve güvende\n" +
      "꒰🌸 **Hoş geldin** mesajı aktif\n\n" +
      "*Sunucunu güzelleştirmek için hazırız!* 🌷"
    )
    .setFooter({ text: "Ultra Aesthetic Gaming Community ✦" })
    .setTimestamp();

  // Try to find a suitable channel to send the success message
  // (the channel where .bomb was sent may be deleted now, so we look for genel-sohbet)
  const allChannels = await guild.channels.fetch();
  let targetChannel = null;
  for (const [, ch] of allChannels) {
    if (ch?.type === ChannelType.GuildText && ch.name.includes("genel-sohbet")) {
      targetChannel = ch;
      break;
    }
  }
  // Fallback: first writable text channel
  if (!targetChannel) {
    for (const [, ch] of allChannels) {
      if (ch?.type === ChannelType.GuildText) {
        targetChannel = ch;
        break;
      }
    }
  }

  if (targetChannel) {
    try {
      await targetChannel.send({ embeds: [successEmbed] });
    } catch (_) {
      console.log("Success message sent (or channel unavailable).");
    }
  }

  console.log("✦ Server setup complete!");
}

// ─────────────────────────────────────────────────────────────
// Welcome message for new members
// ─────────────────────────────────────────────────────────────
client.on("guildMemberAdd", async (member) => {
  try {
    const guild = member.guild;
    const channels = await guild.channels.fetch();

    // Find the hoş-geldin channel
    let welcomeChannel = null;
    for (const [, ch] of channels) {
      if (ch?.type === ChannelType.GuildText && ch.name.includes("ho")) {
        if (ch.name.includes("geldin") || ch.name.includes("geldin")) {
          welcomeChannel = ch;
          break;
        }
      }
    }

    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0xff99cc)
      .setTitle("꒰🌸・Hoş Geldin!")
      .setDescription(
        `**${member.user.username}** sunucumuza katıldı! 🎉\n\n` +
        "꒰📌 Kurallarımızı okumayı unutma!\n" +
        "꒰🎨 **#🎨・rol-al** kanalından rolünü seç\n" +
        "꒰💬 Sohbete katılmak için **#˚・genel-sohbet** kanalını kullanabilirsin\n\n" +
        "Aramıza hoş geldin! Umarız burada çok güzel vakit geçirirsin 🌷✨"
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: "Ultra Aesthetic Gaming Community ✦" })
      .setTimestamp();

    await welcomeChannel.send({ content: `꒰🌸 ${member}`, embeds: [welcomeEmbed] });
  } catch (err) {
    console.error("Welcome message error:", err.message);
  }
});

// ─────────────────────────────────────────────────────────────
// Message listener — .bomb command
// ─────────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  // Ignore bots
  if (message.author.bot) return;
  // Ignore DMs
  if (!message.guild) return;

  if (message.content.trim() === ".bomb") {
    try {
      await runBomb(message);
    } catch (err) {
      console.error("Error in .bomb command:", err);
    }
  }
});

// ─────────────────────────────────────────────────────────────
// Bot ready event
// ─────────────────────────────────────────────────────────────
client.once("clientReady", () => {
  console.log(`✦ Bot online: ${client.user.tag}`);
  console.log(`✦ Serving ${client.guilds.cache.size} guild(s)`);
  client.user.setActivity("꒰🌸・Ultra Aesthetic Server", { type: 3 }); // type 3 = Watching
});

// ─────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────
client.on("error", (err) => console.error("Discord client error:", err));
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));

// ─────────────────────────────────────────────────────────────
// Login using TOKEN from environment
// ─────────────────────────────────────────────────────────────
const token = process.env.TOKEN;
if (!token) {
  console.error("❌ TOKEN environment variable is not set. Please add it to your secrets.");
  process.exit(1);
}

client.login(token);
