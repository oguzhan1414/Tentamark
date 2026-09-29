"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSmartphone, FiSquare, FiLayers, FiTv } from "react-icons/fi";
import type { CardFormat } from "@/lib/cards/typeRegistry";

type CardLivePreviewProps = {
  htmls: string[];
  dimensions: { width: number; height: number };
  format: CardFormat;
  loading?: boolean;
};

export function CardLivePreview({
  htmls,
  dimensions,
  format,
  loading = false,
}: CardLivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [slideIndex, setSlideIndex] = useState(0);

  // Reset slide index when the slide count changes
  const [trackedHtmlsLength, setTrackedHtmlsLength] = useState(htmls.length);
  if (htmls.length !== trackedHtmlsLength) {
    setTrackedHtmlsLength(htmls.length);
    setSlideIndex(0);
  }

  // Dynamically calculate scale based on available container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function updateScale() {
      if (!el) return;
      const availableWidth = el.clientWidth;
      if (availableWidth > 0) {
        const targetW = dimensions.width || (format === "landscape" ? 1920 : 1080);
        const nextScale = availableWidth / targetW;
        setScale(Math.max(0.12, Math.min(nextScale, 0.65)));
      }
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [dimensions.width, dimensions.height, format]);

  const currentHtml = htmls[slideIndex] || htmls[0] || "";
  const isCarousel = htmls.length > 1;
  const isStory = format === "story";
  const isLandscape = format === "landscape";

  const targetWidth = dimensions.width || (isLandscape ? 1920 : 1080);
  const targetHeight = dimensions.height || (isStory ? 1920 : 1080);

  // Scaled dimensions for the wrapper
  const scaledWidth = targetWidth * scale;
  const scaledHeight = targetHeight * scale;

  return (
    <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-end border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          {/* Format indicator badge */}
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            {isStory ? (
              <FiSmartphone className="h-3 w-3 text-rose-500" />
            ) : isLandscape ? (
              <FiTv className="h-3 w-3 text-red-500" />
            ) : (
              <FiSquare className="h-3 w-3 text-cyan-600" />
            )}
            {isStory ? "9:16 Story" : isLandscape ? "16:9 YouTube" : "1:1 Kare"}
          </span>

          {/* Carousel slide count badge */}
          {isCarousel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600">
              <FiLayers className="h-3 w-3" />
              {slideIndex + 1} / {htmls.length}
            </span>
          )}
        </div>
      </div>

      {/* Preview Stage */}
      <div
        ref={containerRef}
        className="relative my-4 flex min-h-[380px] sm:min-h-[440px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-4"
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-[2px] transition-opacity">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-lg">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span className="text-xs font-semibold text-slate-700">Güncelleniyor...</span>
            </div>
          </div>
        )}

        {/* Story Phone Frame or Square/Landscape Studio Frame */}
        <div
          className={`relative transition-all duration-300 ${
            isStory
              ? "rounded-[34px] border-[5px] border-slate-900 bg-black shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/10"
              : isLandscape
              ? "rounded-[18px] border-[4px] border-slate-900 bg-black shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5"
              : "rounded-[22px] border border-slate-200 bg-black shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5"
          }`}
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            maxWidth: "100%",
          }}
        >
          {/* Phone Speaker & Camera Notch for Story Mode */}
          {isStory && (
            <div className="absolute top-2 left-1/2 z-20 h-3.5 w-20 -translate-x-1/2 rounded-full bg-slate-900 ring-1 ring-black" />
          )}

          {/* Scaled Render Iframe */}
          <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
            {currentHtml ? (
              <iframe
                key={`${slideIndex}-${format}`}
                srcDoc={currentHtml}
                title="Card Preview Frame"
                className="pointer-events-none select-none border-0"
                style={{
                  width: `${targetWidth}px`,
                  height: `${targetHeight}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  display: "block",
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                Önizleme yükleniyor...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Navigation Toolbar */}
      {isCarousel && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
            title="Önceki Slayt"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-1.5">
            {htmls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlideIndex(idx)}
                className={`h-2 transition-all cursor-pointer rounded-full ${
                  idx === slideIndex ? "w-6 bg-emerald-500" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
                title={`Slayt ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={slideIndex >= htmls.length - 1}
            onClick={() => setSlideIndex((i) => Math.min(htmls.length - 1, i + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
            title="Sonraki Slayt"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
