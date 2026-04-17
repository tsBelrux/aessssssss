// ─────────────────────────────────────────────────────────────
// AI Chat Command — Aishivex (Gemini 2.5 Flash)
// /ai <soru> veya @Aishivex ile bahset
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder } from "discord.js";
import { GoogleGenAI } from "@google/genai";
import { buildEmbed, COLORS } from "../utils/embed.js";

// Gemini istemcisi — Replit AI Integrations ile
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

// Sistem kişiliği / System personality
const SYSTEM_PROMPT = `Sen Aishivex adlı sevimli, eğlenceli ve estetik bir Discord botusun.
Soft pink ve purple renkleriyle tasarlanmış bir gaming community sunucusunda yaşıyorsun.
Türkçe konuşuyorsun ama zaman zaman İngilizce kelimeler de karışıyor (gaming terimleri gibi).
Kısa, samimi, arkadaşça ve biraz uwu-kawaii bir tarzın var.
Oyun konularında (Valorant, CS2, Minecraft, LoL, GTA RP) bilgilisin.
Yanıtların 2-4 cümle uzunluğunda olmalı, çok uzun olmamalı.
Yanıtlarda ✦, 🌸, ꒰, 𓂃 gibi estetik semboller kullanabilirsin ama aşırıya kaçma.`;

// Konuşma hafızası (guild:user → mesaj geçmişi)
const conversationHistory = new Map();
const MAX_HISTORY = 10; // son 10 mesajı hatırla

/**
 * Slash komut tanımı / Slash command definition
 */
export const data = new SlashCommandBuilder()
  .setName("ai")
  .setDescription("꒰🌸 Aishivex ile konuş! Ask Aishivex anything ✦")
  .addStringOption((opt) =>
    opt.setName("soru").setDescription("Ne sormak istiyorsun? / What do you want to ask?").setRequired(true)
  );

/**
 * Prefix komutu için isim eşleşmesi
 */
export const aliases = ["ai", "sor", "ask"];

/**
 * Komut çalıştırıcı / Command executor
 * @param {import("discord.js").Interaction | import("discord.js").Message} ctx
 * @param {string} question
 */
export async function execute(ctx, question) {
  const isInteraction = ctx.constructor.name.includes("Interaction");

  if (isInteraction) await ctx.deferReply();

  const userId  = isInteraction ? ctx.user.id    : ctx.author.id;
  const guildId = ctx.guild?.id ?? "dm";
  const histKey = `${guildId}:${userId}`;

  // Geçmiş konuşma yükle
  if (!conversationHistory.has(histKey)) conversationHistory.set(histKey, []);
  const history = conversationHistory.get(histKey);

  // Yeni kullanıcı mesajını ekle
  history.push({ role: "user", parts: [{ text: question }] });

  // Maksimum geçmişi koru
  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, 2); // en eski soru-cevap çiftini sil
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        maxOutputTokens: 512,
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const reply = response.text?.trim() ?? "Bir şeyler ters gitti, tekrar dene 🌸";

    // Asistan cevabını geçmişe ekle
    history.push({ role: "model", parts: [{ text: reply }] });
    conversationHistory.set(histKey, history);

    const embed = buildEmbed({
      title:       `✦ Aishivex`,
      description: reply,
      color:       COLORS.purple,
      fields: [
        { name: "𓂃 Soru", value: question.length > 100 ? question.slice(0, 100) + "…" : question, inline: false },
      ],
    });

    if (isInteraction) {
      await ctx.editReply({ embeds: [embed] });
    } else {
      await ctx.reply({ embeds: [embed] });
    }
  } catch (err) {
    console.error("AI hatası:", err.message);
    const errEmbed = buildEmbed({
      title:       "❌ AI Hatası",
      description: "Şu an bir sorun var, birazdan tekrar dene 🌸",
      color:       COLORS.red,
    });
    if (isInteraction) {
      await ctx.editReply({ embeds: [errEmbed] });
    } else {
      await ctx.reply({ embeds: [errEmbed] });
    }
  }
}
