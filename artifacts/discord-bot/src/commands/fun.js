// ═══════════════════════════════════════════════════════════════
// Fun Commands — Aishivex
// rps · love · ship · mock · reverse · dice · trivia
// kelime türetmece · meme · fact · math · embed builder
// ═══════════════════════════════════════════════════════════════

import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";

// ── Kelime türetmece oyun durumu ──────────────────────────
// guildId → { active, lastWord, used: Set, hostId, channelId, timeoutId }
export const wordGames = new Map();

// ── Trivia soruları ───────────────────────────────────────
const TRIVIA = [
  { q: "Minecraft'ta yatak ne işe yarar?", a: "Uyumak / spawn noktası belirlemek", extra: "Nether'de patlıyor!" },
  { q: "Valorant'ta kaç ajan vardır? (2024 sonu)", a: "~25", extra: "Her güncellemede yenisi geliyor" },
  { q: "LoL'da en uzun isimli kahraman hangisidir?", a: "Aurelion Sol", extra: "Uzay ejderi!" },
  { q: "GTA V kaç yılında çıktı?", a: "2013", extra: "Hala oynanıyor!" },
  { q: "Discord'un rengi nedir?", a: "Blurple (#5865F2)", extra: "Yeni tasarımda biraz değişti" },
  { q: "PC'de Ctrl+Z ne yapar?", a: "Geri al (Undo)", extra: "En çok kullanılan kısayol!" },
  { q: "En popüler Battle Royale oyunu hangisidir?", a: "Fortnite / PUBG", extra: "Tartışmalı!" },
  { q: "CS2'de en pahalı bıçak tipi hangisidir?", a: "Karambit", extra: "Milyonlarca TL edebiliyor" },
  { q: "YouTube ne zaman kuruldu?", a: "2005", extra: "Google 2006'da satın aldı" },
  { q: "Pixel başına 4K çözünürlük kaçtır?", a: "3840 × 2160", extra: "UHD olarak da bilinir" },
];

// ── Rastgele seç ──────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────────────────────
// /rps — Taş Kağıt Makas
// ─────────────────────────────────────────────────────────────
export const rpsData = new SlashCommandBuilder()
  .setName("rps")
  .setDescription("꒰✊ Taş Kağıt Makas oyna! ✦")
  .addStringOption((o) =>
    o.setName("secim").setDescription("Seçimini yap").setRequired(true)
      .addChoices(
        { name: "✊ Taş",    value: "tas"   },
        { name: "📄 Kağıt", value: "kagit" },
        { name: "✂️ Makas", value: "makas" },
      )
  );

export async function executeRps(interaction) {
  const choices = ["tas", "kagit", "makas"];
  const labels  = { tas: "✊ Taş", kagit: "📄 Kağıt", makas: "✂️ Makas" };
  const user    = interaction.options.getString("secim");
  const bot     = pick(choices);

  let result;
  if (user === bot) result = "🤝 Berabere!";
  else if (
    (user === "tas" && bot === "makas") ||
    (user === "kagit" && bot === "tas") ||
    (user === "makas" && bot === "kagit")
  ) result = "🎉 Kazandın!";
  else result = "😔 Kaybettin!";

  const color = result.includes("Kazan") ? COLORS.green : result.includes("Kaybet") ? COLORS.red : COLORS.blue;

  interaction.reply({
    embeds: [buildEmbed({
      title:  "꒰✊ Taş Kağıt Makas",
      color,
      fields: [
        { name: "Sen",     value: labels[user], inline: true },
        { name: "vs",      value: "⚡",          inline: true },
        { name: "Aishivex",value: labels[bot],  inline: true },
        { name: "Sonuç",   value: `**${result}**`, inline: false },
      ],
      timestamp: false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /love — Aşk hesaplayıcı
// ─────────────────────────────────────────────────────────────
export const loveData = new SlashCommandBuilder()
  .setName("love")
  .setDescription("꒰💕 Aşk oranını hesapla! ✦")
  .addUserOption((o) => o.setName("kullanici").setDescription("Kimi seviyorsun?").setRequired(true));

export async function executeLove(interaction) {
  const target = interaction.options.getUser("kullanici");
  // Deterministik ama "random" görünen hesaplama
  const seed = (interaction.user.id + target.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct  = (seed % 101);

  const heart = pct >= 80 ? "💖" : pct >= 50 ? "💕" : pct >= 30 ? "💛" : "💔";
  const bar   = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
  const msg   = pct >= 80 ? "Mükemmel eşleşme! 🌸"
              : pct >= 60 ? "Güzel gidiyorsunuz ✦"
              : pct >= 40 ? "Biraz çaba gerekli 🌸"
              : "Belki arkadaş kalın?";

  interaction.reply({
    embeds: [buildEmbed({
      title:  `${heart} Aşk Ölçer`,
      color:  COLORS.pink,
      fields: [
        { name: "Çift",    value: `${interaction.user} ❤️ ${target}`, inline: false },
        { name: "Oran",    value: `\`${bar}\` **%${pct}**`,           inline: false },
        { name: "Yorum",   value: msg,                                 inline: false },
      ],
      timestamp: false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /ship — İki kişiyi birleştir
// ─────────────────────────────────────────────────────────────
export const shipData = new SlashCommandBuilder()
  .setName("ship")
  .setDescription("꒰💞 İki kişiyi ship et! ✦")
  .addUserOption((o) => o.setName("birinci").setDescription("1. Kişi").setRequired(true))
  .addUserOption((o) => o.setName("ikinci").setDescription("2. Kişi").setRequired(true));

export async function executeShip(interaction) {
  const u1   = interaction.options.getUser("birinci");
  const u2   = interaction.options.getUser("ikinci");
  const name = u1.displayName.slice(0, Math.ceil(u1.displayName.length / 2))
             + u2.displayName.slice(Math.floor(u2.displayName.length / 2));

  const seed  = (u1.id + u2.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = seed % 101;

  interaction.reply({
    embeds: [buildEmbed({
      title:       `꒰💞 Ship: ${name}`,
      description: `${u1} + ${u2} = **${name}**\n\n꒰ Uyum puanı: **%${score}** 🌸`,
      color:       COLORS.pink,
      timestamp:   false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /mock — SpongeBob mock metni
// ─────────────────────────────────────────────────────────────
export const mockData = new SlashCommandBuilder()
  .setName("mock")
  .setDescription("꒰🧽 SpongeBob mock! ✦")
  .addStringOption((o) => o.setName("metin").setDescription("Ne yazalım?").setRequired(true));

export async function executeMock(interaction) {
  const text   = interaction.options.getString("metin");
  const mocked = text.split("").map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join("");

  interaction.reply({
    embeds: [buildEmbed({
      title:       "꒰🧽 MoCk MeTnİ",
      description: `> ${mocked}`,
      color:       COLORS.yellow,
      timestamp:   false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /reverse — Metni ters çevir
// ─────────────────────────────────────────────────────────────
export const reverseData = new SlashCommandBuilder()
  .setName("reverse")
  .setDescription("꒰🔄 Metni ters çevir ✦")
  .addStringOption((o) => o.setName("metin").setDescription("Ters çevrilecek metin").setRequired(true));

export async function executeReverse(interaction) {
  const text = interaction.options.getString("metin");
  const rev  = [...text].reverse().join("");

  interaction.reply({
    embeds: [buildEmbed({
      title:       "꒰🔄 Ters Metin",
      description: `> ${rev}`,
      color:       COLORS.purple,
      timestamp:   false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /dice — Zar at
// ─────────────────────────────────────────────────────────────
export const diceData = new SlashCommandBuilder()
  .setName("dice")
  .setDescription("꒰🎲 Zar at! Roll the dice ✦")
  .addIntegerOption((o) => o.setName("yuz").setDescription("Kaç yüzlü? (2-1000)").setMinValue(2).setMaxValue(1000).setRequired(false))
  .addIntegerOption((o) => o.setName("adet").setDescription("Kaç zar? (1-10)").setMinValue(1).setMaxValue(10).setRequired(false));

export async function executeDice(interaction) {
  const sides = interaction.options.getInteger("yuz")  ?? 6;
  const count = interaction.options.getInteger("adet") ?? 1;

  const rolls   = Array.from({ length: count }, () => Math.ceil(Math.random() * sides));
  const total   = rolls.reduce((a, b) => a + b, 0);
  const rollStr = rolls.map((r) => `🎲 **${r}**`).join("  ");

  interaction.reply({
    embeds: [buildEmbed({
      title:  `꒰🎲 ${count}d${sides} Zar`,
      color:  COLORS.blue,
      fields: [
        { name: "Sonuçlar", value: rollStr,         inline: false },
        { name: "Toplam",   value: `**${total}**`,  inline: count > 1 },
      ],
      timestamp: false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /choose — Seç
// ─────────────────────────────────────────────────────────────
export const chooseData = new SlashCommandBuilder()
  .setName("choose")
  .setDescription("꒰🎯 Seçenekler arasından seç ✦")
  .addStringOption((o) => o.setName("a").setDescription("1. Seçenek").setRequired(true))
  .addStringOption((o) => o.setName("b").setDescription("2. Seçenek").setRequired(true))
  .addStringOption((o) => o.setName("c").setDescription("3. Seçenek").setRequired(false))
  .addStringOption((o) => o.setName("d").setDescription("4. Seçenek").setRequired(false));

export async function executeChoose(interaction) {
  const opts = ["a", "b", "c", "d"]
    .map((k) => interaction.options.getString(k))
    .filter(Boolean);
  const chosen = pick(opts);

  interaction.reply({
    embeds: [buildEmbed({
      title:       "꒰🎯 Seçtim!",
      description: `Seçenekler arasından: **${chosen}** ✦`,
      color:       COLORS.purple,
      timestamp:   false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /trivia — Trivia sorusu
// ─────────────────────────────────────────────────────────────
export const triviaData = new SlashCommandBuilder()
  .setName("trivia")
  .setDescription("꒰❓ Trivia sorusu! Test your knowledge ✦");

export async function executeTrivia(interaction) {
  const q = pick(TRIVIA);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`trivia_reveal_${interaction.id}`).setLabel("Cevabı Gör 👁️").setStyle(ButtonStyle.Secondary),
  );

  const msg = await interaction.reply({
    embeds: [buildEmbed({
      title:       "꒰❓ Trivia Sorusu",
      description: `**${q.q}**\n\n*Düşün... sonra cevabı gör!*`,
      color:       COLORS.blue,
    })],
    components: [row],
    fetchReply: true,
  });

  const collector = msg.createMessageComponentCollector({ time: 30_000 });
  collector.on("collect", async (i) => {
    await i.update({
      embeds: [buildEmbed({
        title:       "꒰✅ Cevap",
        description: `**Soru:** ${q.q}\n**Cevap:** ${q.a}\n\n*${q.extra}*`,
        color:       COLORS.green,
      })],
      components: [],
    });
  });
  collector.on("end", () => msg.edit({ components: [] }).catch(() => {}));
}

// ─────────────────────────────────────────────────────────────
// /kelime-baslat — Kelime Türetmece oyununu başlat
// ─────────────────────────────────────────────────────────────
export const kelimeData = new SlashCommandBuilder()
  .setName("kelime-baslat")
  .setDescription("꒰📝 Kelime türetmece oyununu başlat! ✦")
  .addStringOption((o) =>
    o.setName("baslangic").setDescription("Başlangıç kelimesi (boş = otomatik)").setRequired(false)
  );

const STARTER_WORDS = [
  "araba", "elma", "ayakkabı", "melek", "kelebek",
  "silah", "harita", "tahta", "ananas", "bardak",
];

export async function executeKelime(interaction) {
  if (wordGames.has(interaction.guild.id)) {
    return interaction.reply({
      embeds: [buildEmbed({ title: "❌", description: "Bu sunucuda zaten bir oyun devam ediyor! 🌸", color: COLORS.red })],
      ephemeral: true,
    });
  }

  const startWord = interaction.options.getString("baslangic")?.toLowerCase() ?? pick(STARTER_WORDS);

  const game = {
    active:    true,
    lastWord:  startWord,
    used:      new Set([startWord]),
    hostId:    interaction.user.id,
    channelId: interaction.channelId,
    players:   new Map(), // userId → score
    timeoutId: null,
  };

  wordGames.set(interaction.guild.id, game);

  // 5 dakika sonra oyunu sonlandır
  game.timeoutId = setTimeout(() => endWordGame(interaction.guild, interaction.channel), 5 * 60 * 1000);

  await interaction.reply({
    embeds: [buildEmbed({
      title:       "꒰📝 Kelime Türetmece Başladı!",
      description: [
        `Başlangıç kelimesi: **${startWord.toUpperCase()}**`,
        `Son harf: **${startWord.at(-1).toUpperCase()}** ile başlayan bir kelime yaz!`,
        "",
        "꒰ Kurallar:",
        "• Kelime son harfle başlamalı",
        "• Daha önce kullanılmış kelime olmaz",
        "• Her doğru kelime için +1 puan",
        "• 5 dakika boyunca devam eder",
      ].join("\n"),
      color: COLORS.purple,
    })],
  });
}

// Kelime türetmece oyununu bitir
export function endWordGame(guild, channel) {
  const game = wordGames.get(guild.id);
  if (!game) return;

  clearTimeout(game.timeoutId);
  game.active = false;
  wordGames.delete(guild.id);

  if (!game.players.size) {
    channel?.send({
      embeds: [buildEmbed({ title: "꒰📝 Oyun Bitti", description: "Kimse oynamadı 🌸", color: COLORS.gray })],
    }).catch(() => {});
    return;
  }

  const sorted = [...game.players.entries()].sort((a, b) => b[1] - a[1]);
  const board  = sorted.map(([id, pts], i) => `${i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} <@${id}> — **${pts} puan**`).join("\n");

  channel?.send({
    embeds: [buildEmbed({
      title:       "꒰🏁 Kelime Türetmece Bitti!",
      description: `Skor tablosu:\n\n${board}`,
      color:       COLORS.yellow,
    })],
  }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────
// /fact — Rastgele ilginç bilgi
// ─────────────────────────────────────────────────────────────
export const factData = new SlashCommandBuilder()
  .setName("fact")
  .setDescription("꒰💡 Rastgele ilginç bilgi! ✦");

const FACTS = [
  "Bal hiç bozulmaz! 3000 yıllık mısır piramitlerindeki bal hala yenilebilir durumda.",
  "Bir grup flamingoyu 'flamboyance' olarak adlandırılır.",
  "Balıklar su içmez — solungaçlarından emerler.",
  "Dünyanın en kısa savaşı 38-45 dakika sürdü (İngiliz-Zanzibar Savaşı, 1896).",
  "Oktopusların 3 kalbi ve mavi kanı var.",
  "NASA'nın uzay giysisi 11 milyon dolar.",
  "Minecraft'ın yaratıcısı Notch, oyunu 2.5 milyar dolara Microsoft'a sattı.",
  "Discord'un ilk adı 'Fates Forever' oyunuydu.",
  "Bir gün 23 saat 56 dakika 4 saniyedir — tam 24 saat değil!",
  "İnsanların %10'u sol elini kullanır.",
  "Dünyanın en derin noktası Mariana Çukuru: 10.994 metre derinliğinde.",
  "Kedi miyavlaması yalnızca insanlarla iletişim için geliştirildi. Kediler birbirlerine miyavlamaz.",
];

export async function executeFact(interaction) {
  interaction.reply({
    embeds: [buildEmbed({
      title:       "꒰💡 İlginç Bilgi",
      description: pick(FACTS),
      color:       COLORS.blue,
      timestamp:   false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /rate — Bir şeyi değerlendir
// ─────────────────────────────────────────────────────────────
export const rateData = new SlashCommandBuilder()
  .setName("rate")
  .setDescription("꒰⭐ Bir şeyi değerlendir ✦")
  .addStringOption((o) => o.setName("sey").setDescription("Ne değerlendirilsin?").setRequired(true));

export async function executeRate(interaction) {
  const thing = interaction.options.getString("sey");
  const score = Math.floor(Math.random() * 101);
  const stars  = "⭐".repeat(Math.round(score / 20)).padEnd(5, "☆");

  const verdict = score >= 90 ? "Mükemmel! 🌸"
    : score >= 70 ? "Oldukça iyi ✦"
    : score >= 50 ? "Fena değil"
    : score >= 30 ? "Geliştirilmeli 🌸"
    : "Hmm... 😅";

  interaction.reply({
    embeds: [buildEmbed({
      title:       `꒰⭐ ${thing} değerlendirmesi`,
      description: `**${stars}** (${score}/100)\n*${verdict}*`,
      color:       score >= 60 ? COLORS.green : score >= 30 ? COLORS.yellow : COLORS.red,
      timestamp:   false,
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// /bumpdurum — Disboard bump durumunu gör
// ─────────────────────────────────────────────────────────────
export const bumpdurumData = new SlashCommandBuilder()
  .setName("bumpdurum")
  .setDescription("꒰🚀 Disboard bump durumunu gör ✦");

export async function executeBumpdurum(interaction) {
  const { getBumpStatus } = await import("../utils/bump.js");
  const status = getBumpStatus(interaction.guild.id);

  const embed = buildEmbed({
    title:  "꒰🚀 Bump Durumu",
    color:  status.scheduled ? COLORS.yellow : COLORS.green,
    fields: status.scheduled
      ? [{ name: "⏱️ Kalan Süre", value: `${status.remainingMin} dakika`, inline: true }]
      : [{ name: "✅ Hazır!", value: "Şu an `/bump` atabilirsin! 🌸", inline: true }],
    timestamp: false,
  });

  interaction.reply({ embeds: [embed] });
}
