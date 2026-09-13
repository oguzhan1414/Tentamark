"use server";

import { createClient } from "@/lib/supabase/server";
import { callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import { ALL_PLATFORMS, PLATFORM_LABEL, type LaunchPlatform } from "./platforms";

export type CalendarSmartDraft = {
  title: string;
  category: string;
  suggestedTime: string; // e.g. "19:00"
  scheduledIso: string;
  rationale: string;
  captions: Partial<Record<LaunchPlatform, string>>;
};

function jsonCaptionsShapeExample(platforms: LaunchPlatform[]): string {
  return platforms.map((p) => `    "${p}": "${PLATFORM_LABEL[p]} için kancası güçlü bir açıklama"`).join(",\n");
}

export async function fillCalendarDateWithAi(
  brandId: string,
  targetDateStr: string, // YYYY-MM-DD
  existingTitles: string[] = [],
  desiredCategory?: string
): Promise<CalendarSmartDraft> {
  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka henüz detaylı tanımlanmadı, genel ve profesyonel bir yaklaşım benimse.";

  // Only draft captions for platforms the brand can actually publish to —
  // this used to always ask for instagram/facebook/linkedin regardless of
  // what's connected, so a brand with only Instagram would still get
  // content_platforms rows queued for platforms it has no account for, and
  // a connected TikTok/Threads account never got a caption at all since
  // those two weren't in the hardcoded JSON example. Same
  // connected-platforms query ComposeForm.tsx already uses.
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform")
    .eq("brand_id", brandId)
    .eq("status", "active");
  const connected = ALL_PLATFORMS.filter((p) => (accounts ?? []).some((a) => a.platform === p));
  const targetPlatforms = connected.length > 0 ? connected : (["instagram"] as LaunchPlatform[]);

  const platformList = targetPlatforms.map((p) => PLATFORM_LABEL[p]).join(", ");

  const dateObj = new Date(targetDateStr);
  const dayNameTr = dateObj.toLocaleDateString("tr-TR", { weekday: "long" });

  const existingContext =
    existingTitles.length > 0
      ? `Bu haftada zaten planlanmış olan diğer gönderiler:\n- ${existingTitles.slice(0, 5).join("\n- ")}\n(Lütfen bu konuları tekrarlama, takvime çeşitlilik kat!)`
      : "Bu hafta henüz başka gönderi planlanmamış.";

  const categoryInstruction = desiredCategory
    ? `\nZORUNLU KATEGORİ: Bu gönderi mutlaka "${desiredCategory}" kategorisinde olmalı — takvim içerik dengesi analizi bu kategoride eksiklik tespit etti, "category" alanına tam olarak bu değeri yaz.\n`
    : "";

  const systemPrompt = `Sen Tentamark'ın Kıdemli Sosyal Medya Stratejistisin.
Görevin: Kullanıcının takviminde BOŞ kalan belirli bir gün (${targetDateStr}, ${dayNameTr}) için, markanın ses tonuna ve hedeflerine tam oturan, hemen paylaşılmaya hazır yüksek etkileşimli bir gönderi kurgulamak.

Marka Bilgileri:
${brandContext}

Kullanılabilir Platformlar: ${platformList}

Mevcut Takvim Durumu:
${existingContext}
${categoryInstruction}
Kesin Kurallar:
1. Seçilen gün (${dayNameTr}) için kitlenin en aktif olduğu saati belirle (örn: hafta içi akşam 18:30-20:30, hafta sonu 11:00-14:00).
2. SADECE ve SADECE aşağıdaki JSON formatında yanıt ver, başında veya sonunda markdown bloğu (\`\`\`) veya açıklama ekleme:
{
  "title": "Gönderi başlığı / ana fikir (tek net cümle)",
  "category": "İçerik kategorisi (örn. Eğitici, İlham Verici, Ürün/Hizmet, Eğlence, Topluluk)",
  "suggested_time": "HH:MM formatında saat (örn: '19:00')",
  "rationale": "Bu içeriğin neden bu günde ve bu saatte paylaşılması gerektiğinin 1-2 cümlelik stratejik gerekçesi",
  "captions": {
${jsonCaptionsShapeExample(targetPlatforms)}
  }
}

3. Her platformun açıklaması o mecranın ruhuna uygun olsun, aynı metni kopyalama. "captions" nesnesi SADECE yukarıda listelenen platformları içersin, başka platform ekleme.`;

  const userMessage = `Hedef Gün: ${targetDateStr} (${dayNameTr})\nLütfen bu boş gün için en etkili içerik taslağını oluştur.`;

  const groqResult = await callGroq(systemPrompt, userMessage, {
    temperature: 0.7,
    maxTokens: 2500,
    jsonMode: true,
  });

  const cleanedJson = groqResult.content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleanedJson);

  const suggestedTime = String(parsed.suggested_time ?? "18:00").trim();
  const [hours, minutes] = suggestedTime.split(":").map(Number);
  const scheduledDate = new Date(targetDateStr);
  scheduledDate.setHours(Number.isNaN(hours) ? 18 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);

  const captions: Partial<Record<LaunchPlatform, string>> = {};
  const captionsRaw = parsed.captions && typeof parsed.captions === "object" ? parsed.captions : {};
  for (const p of targetPlatforms) {
    if (typeof captionsRaw[p] === "string" && captionsRaw[p].trim()) {
      captions[p] = captionsRaw[p].trim();
    }
  }

  return {
    title: String(parsed.title ?? "Yeni Gönderi").trim(),
    category: String(parsed.category ?? "Genel").trim(),
    suggestedTime: suggestedTime || "18:00",
    scheduledIso: scheduledDate.toISOString(),
    rationale: String(parsed.rationale ?? "Kitlenizin en aktif olduğu zaman dilimi.").trim(),
    captions,
  };
}
