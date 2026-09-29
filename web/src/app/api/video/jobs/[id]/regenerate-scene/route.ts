import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { regenerateSceneCopy } from "@/lib/video/buildVideoInputProps";
import { canRegenerateWithAI } from "@/lib/video/sceneFieldConfig";
import type { ScenePlanItem } from "@/lib/video/types";

/*
  Single-scene AI regeneration (Faz 6's central acceptance criterion) — a
  small, isolated Groq call via regenerateSceneCopy(), NOT a re-run of the
  whole-video generateSceneCopy() prompt. Reads resolvedSourceText/
  resolvedProduct cached in scene_plan by prepareVideoDraft.ts specifically
  so this never re-scrapes a product_url. Writes the single updated scene
  back and returns it so the client can update its local state without a
  full refetch.
*/
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { sceneIndex?: number };
  if (typeof body.sceneIndex !== "number" || !Number.isInteger(body.sceneIndex) || body.sceneIndex < 0) {
    return NextResponse.json({ error: "Geçersiz sahne index'i." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("video_render_jobs")
    .select("id, status, scene_plan")
    .eq("id", id)
    .eq("brand_id", brand.id)
    .maybeSingle();
  if (error || !job) return NextResponse.json({ error: "Video işi bulunamadı." }, { status: 404 });
  if (job.status !== "draft") return NextResponse.json({ error: "Bu iş artık düzenlenemez." }, { status: 400 });

  const plan = job.scene_plan && typeof job.scene_plan === "object" ? (job.scene_plan as Record<string, unknown>) : {};
  const scenes = Array.isArray(plan.scenes) ? (plan.scenes as ScenePlanItem[]) : [];
  const scene = scenes[body.sceneIndex];
  if (!scene) return NextResponse.json({ error: "Sahne bulunamadı." }, { status: 400 });
  if (!canRegenerateWithAI(scene.archetype)) {
    return NextResponse.json({ error: "Bu sahne türü yapay zeka ile yeniden üretilemez." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const brandContext = await getBrandContext(brand.id, { client: admin });
    const resolvedSourceText = typeof plan.resolvedSourceText === "string" ? plan.resolvedSourceText : "";
    const resolvedProduct = plan.resolvedProduct && typeof plan.resolvedProduct === "object" ? plan.resolvedProduct : undefined;

    const updatedScene = await regenerateSceneCopy(
      scene,
      resolvedSourceText,
      resolvedProduct as Parameters<typeof regenerateSceneCopy>[2],
      brand.id,
      brandContext.formattedText,
      brandContext.brandName,
      admin
    );

    const nextScenes = scenes.map((s, i) => (i === body.sceneIndex ? updatedScene : s));
    const { error: updateError } = await admin
      .from("video_render_jobs")
      .update({ scene_plan: { ...plan, scenes: nextScenes } })
      .eq("id", id);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ scene: updatedScene });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sahne yeniden üretilemedi." },
      { status: 500 }
    );
  }
}
