"use client";

import { Player } from "@remotion/player";
import { Main } from "../../../../remotion/Main";
import { getRenderedDurationInFrames, VIDEO_RECIPES } from "@/lib/video/scenePlan";
import type { VideoInputProps } from "@/lib/video/types";

export function VideoPlanPreview({ inputProps }: { inputProps: VideoInputProps }) {
  const isVertical = inputProps.format === "vertical";
  const durationInFrames = getRenderedDurationInFrames(inputProps.scenePlan);
  const recipe = inputProps.recipeId ? VIDEO_RECIPES[inputProps.recipeId] : null;

  return (
    <section className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Canlı storyboard önizlemesi</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{recipe?.label ?? "Otomatik video"}</p>
          {recipe && <p className="mt-0.5 text-xs text-slate-500">{recipe.description}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {inputProps.scenePlan.map((scene, index) => (
            <span key={`${scene.archetype}-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
              {index + 1}. {scene.archetype}
            </span>
          ))}
        </div>
      </div>
      <div className={`mx-auto overflow-hidden rounded-2xl bg-black ${isVertical ? "max-w-[280px]" : "w-full"}`}>
        <Player
          component={Main}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={isVertical ? 1080 : 1920}
          compositionHeight={isVertical ? 1920 : 1080}
          fps={30}
          controls
          clickToPlay
          loop
          style={{ width: "100%", aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
        />
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        Bu düşük maliyetli önizlemedir; son metinler ve ürün verileri render sırasında marka bağlamıyla hazırlanır.
      </p>
    </section>
  );
}
