"use client";

import { useEffect, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { getTemplateCategories, type TemplateCategoryId } from "@/lib/content/templateCategories";
import { useLanguage } from "@/context/LanguageContext";

// Rendered only while open (see ComposeForm's `{saveTemplateOpen && <...>}`)
// rather than gated on an `isOpen` prop — that way each open is a fresh
// mount and the form fields start empty on their own, no reset effect
// needed to clear out whatever was typed for a previous template.
export default function SaveTemplateModal({
  onCancel,
  onSave,
  bodyPreview,
  saving,
}: {
  onCancel: () => void;
  onSave: (name: string, category: TemplateCategoryId) => void;
  bodyPreview: string;
  saving: boolean;
}) {
  const { t, locale } = useLanguage();
  const sm = t.dashboard.templates.saveModal;
  const common = t.dashboard.common;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategoryId>("genel");

  const categories = getTemplateCategories(locale);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-template-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xl shadow-slate-950/15 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-1">
          <h3 id="save-template-title" className="font-display text-base font-bold text-slate-900 tracking-tight">
            {sm.title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label={sm.close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-[11px] leading-relaxed text-slate-500 line-clamp-3">
          {bodyPreview}
        </p>

        <div className="mt-4 space-y-1.5">
          <label htmlFor="template_name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {sm.nameLabel}
          </label>
          <input
            id="template_name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name.trim(), category)}
            placeholder={sm.namePlaceholder}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {sm.categoryLabel}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  category === c.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            {common.cancel}
          </button>
          <button
            type="button"
            disabled={!name.trim() || saving}
            onClick={() => onSave(name.trim(), category)}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? sm.saving : common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
