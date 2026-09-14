"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, VISION_MODEL, callGroq, callGroqVision } from "./groqModel";
import { PLATFORM_LABEL, PLATFORM_RULE, type LaunchPlatform } from "./platforms";

export type { LaunchPlatform };
export type GeneratedDrafts = Partial<Record<LaunchPlatform, string>>;

const PROMPT_VERSION = "draft-v4-vision-aware";

function parseDrafts(raw: string, platforms: LaunchPlatform[]): GeneratedDrafts & { needsRewrite: boolean } {
  const parsed = JSON.parse(raw);
  const drafts: GeneratedDrafts = {};
  for (const platform of platforms) {
    drafts[platform] = String(parsed[platform] ?? "");
  }
  if (platforms.some((p) => !drafts[p])) {
    throw new Error("Model seçilen platformların hepsini döndürmedi.");
  }
  return { ...drafts, needsRewrite: Boolean(parsed.needsRewrite) };
}

function jsonShapeExample(platforms: LaunchPlatform[]): string {
  const fields = platforms.map((p) => `"${p}": "..."`).join(", ");
  return `{${fields}, "needsRewrite": true veya false}`;
}

function buildCritiquePrompt(drafts: GeneratedDrafts, platforms: LaunchPlatform[]): string {
  const body = platforms.map((p) => `${PLATFORM_LABEL[p]}: ${drafts[p]}`).join("\n");
  const shape = `{${platforms.map((p) => `"${p}": "..."`).join(", ")}}`;
  return `Sen bir sosyal medya editörüsün. Aşağıdaki gönderi(leri) netlik, özgünlük ve platforma uygunluk açısından incele. Klişe veya zayıfsa daha güçlü şekilde yeniden yaz, akıcıysa aynen koru — gereksiz yere değiştirme. Türkçe yaz.

${body}

Sadece şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
${shape}`;
}

/*
  First real version of the chain in 12-backend-logic.md §12.5. Collapsed
  into one call rather than the full positioning -> content_strategy -> idea
  -> platform_adapt -> quality_pass pipeline — that needs brand_strategy
  (versioned, persisted positioning) which doesn't exist yet. This folds the
  spirit of stages 3-6 into a single prompt instead. Logged under stage
  "idea_and_platform_adapt" so it's honest about being the simplified version,
  not silently pretending to be the full chain.

  Platform subset (dashboard IA restructure): Compose no longer force-selects
  all three platforms — only the ones the user actually checked get prompted
  for and get content_platforms rows. GeneratedDrafts is Partial, not a fixed
  3-key Record, on purpose.

  Self-critique pass added after competitive research (repo-research/,
  OpenSocial's critique.rewrite.ts pattern): the first call rates its own
  output via `needsRewrite`; only when it flags itself weak do we spend a
  second Groq call tightening the copy. Logged separately under the
  already-anticipated "quality_pass" stage name from the ai_runs table
  comment, so cost/latency for the extra pass is visible, not hidden inside
  the first call's numbers. A failure in this second pass is non-fatal — we
  already have a usable first draft, so we log the error and fall back to it
  rather than failing the whole generation.

  Server-only (Server Action): the Groq key must never reach the browser.
*/
import { getBrandContext } from "../brand/getBrandContext";

export type ContentFormat = "post" | "story" | "reel";

const FORMAT_RULE: Record<ContentFormat, string> = {
  post: "Bu standart bir besleme (feed) gönderisi — normal uzunlukta, kalıcı bir paylaşım.",
  story: "Bu bir Hikaye (Story) — kısa ömürlü, samimi, anlık ve ham hissettiren, çok kısa bir metin yaz.",
  reel: "Bu bir Makara (Reels/Shorts) videosu için altyazı — kısa, enerjik, ilk saniyede durduran bir kanca ile başla.",
};

export async function generateDrafts(
  brandId: string,
  idea: string,
  platforms: LaunchPlatform[],
  format: ContentFormat = "post",
  // A real https:// URL or a base64 data URI of the attached image — set
  // whenever ComposeForm has a photo attached, so the model actually
  // describes what's in it instead of writing generic text next to media
  // it never saw. Omitted (or a video) falls back to the original
  // text-only call exactly as before.
  mediaUrl?: string
): Promise<GeneratedDrafts> {
  if (platforms.length === 0) {
    throw new Error("En az bir platform seçilmeli.");
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext = brandCtx.formattedText || "Marka kimliği henüz tanımlanmadı, genel ve profesyonel bir ton kullan.";
  const supabase = await createClient();

  const platformList = platforms.map((p) => PLATFORM_LABEL[p]).join(", ");
  const platformRules = platforms.map((p) => `- ${PLATFORM_RULE[p]}`).join("\n");

  const visionInstruction = mediaUrl
    ? `\n\nEkli bir görsel/fotoğraf var — önce onu dikkatle incele (ürün, ortam, renkler, kompozisyon, görünen yazılar, genel ruh hali) ve gönderi metinlerinde görselde GERÇEKTEN görülenlere somut şekilde değin. Görseli görmezden gelip fikir metnine dayalı genel geçer bir şey yazma; görsel neyi gösteriyorsa metin ona atıfta bulunmalı.`
    : "";

  const systemPrompt = `Sen Tentamark için çalışan bir sosyal medya metin yazarısın. Verilen marka bağlamını ve fikri kullanarak ${platformList} için ayrı, birbirinden farklı gönderi metinleri yaz.

İçerik Formatı: ${FORMAT_RULE[format]}

Kurallar:
- Türkçe yaz, doğal ve akıcı, çeviri gibi durmasın.
${platformRules}
- Klişe AI ifadelerinden kaçın ("harika bir fırsat", "hayatınızı değiştirecek" gibi).
- Marka kimliğine (varsa yasaklı konular, ton) sadık kal.${visionInstruction}

Marka bağlamı: ${brandContext}

Sadece şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
${jsonShapeExample(platforms)}

needsRewrite: kendi ürettiğin metinler klişe, tekrar eden veya zayıfsa true, gerçekten akıcı ve özgünse false yaz.`;

  let drafts: GeneratedDrafts = {};

  const firstStart = Date.now();
  try {
    const result = mediaUrl
      ? await callGroqVision(systemPrompt, idea, [mediaUrl])
      : await callGroq(systemPrompt, idea);
    const parsed = parseDrafts(result.content, platforms);
    drafts = Object.fromEntries(platforms.map((p) => [p, parsed[p]]));

    await supabase.from("ai_runs").insert({
      brand_id: brandId,
      stage: "idea_and_platform_adapt",
      prompt_version: PROMPT_VERSION,
      model: mediaUrl ? VISION_MODEL : MODEL,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      cost_estimate_usd: 0,
      latency_ms: Date.now() - firstStart,
      status: "SUCCESS",
      error: null,
    });

    if (parsed.needsRewrite) {
      const secondStart = Date.now();
      try {
        const critique = await callGroq(buildCritiquePrompt(drafts, platforms), "Yeniden yaz.");
        const rewritten = parseDrafts(critique.content, platforms);
        drafts = Object.fromEntries(platforms.map((p) => [p, rewritten[p]]));

        await supabase.from("ai_runs").insert({
          brand_id: brandId,
          stage: "quality_pass",
          prompt_version: PROMPT_VERSION,
          model: MODEL,
          input_tokens: critique.inputTokens,
          output_tokens: critique.outputTokens,
          cost_estimate_usd: 0,
          latency_ms: Date.now() - secondStart,
          status: "SUCCESS",
          error: null,
        });
      } catch (critiqueErr) {
        // Non-fatal: the first pass already produced usable drafts.
        await supabase.from("ai_runs").insert({
          brand_id: brandId,
          stage: "quality_pass",
          prompt_version: PROMPT_VERSION,
          model: MODEL,
          input_tokens: 0,
          output_tokens: 0,
          cost_estimate_usd: 0,
          latency_ms: Date.now() - secondStart,
          status: "ERROR",
          error: critiqueErr instanceof Error ? critiqueErr.message : "Bilinmeyen hata",
        });
      }
    }

    return drafts;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    await supabase.from("ai_runs").insert({
      brand_id: brandId,
      stage: "idea_and_platform_adapt",
      prompt_version: PROMPT_VERSION,
      model: MODEL,
      input_tokens: 0,
      output_tokens: 0,
      cost_estimate_usd: 0,
      latency_ms: Date.now() - firstStart,
      status: "ERROR",
      error: message,
    });
    throw new Error(message || "Taslak üretilemedi.");
  }
}
