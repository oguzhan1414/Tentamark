"use client";

import { useEffect } from "react";
import { HiOutlineXMark, HiOutlineTrash, HiOutlineDocumentText } from "react-icons/hi2";
import { templateCategoryIcon, templateCategoryLabel } from "@/lib/content/templateCategories";
import { useLanguage } from "@/context/LanguageContext";

export type ContentTemplate = { id: string; name: string; body: string; category: string | null };

export default function TemplatePickerModal({
  isOpen,
  onClose,
  templates,
  onApply,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: ContentTemplate[];
  onApply: (template: ContentTemplate) => void;
  onDelete: (id: string) => void;
}) {
  const { t, isEn, locale } = useLanguage();
  const pm = t.dashboard.templates.pickerModal;

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-picker-title"
        className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-950/15 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <div>
            <h3 id="template-picker-title" className="font-display text-base font-bold text-slate-900 tracking-tight">
              {pm.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pm.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={pm.close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <HiOutlineDocumentText className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-medium text-slate-400">
                {isEn
                  ? 'You don\'t have any saved templates yet. After drafting a caption, click "Save as Template".'
                  : 'Henüz kaydedilmiş şablonun yok. Bir taslak yazdıktan sonra "Şablon Olarak Kaydet"e bas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left transition hover:border-rose-200 hover:bg-rose-50/40"
                >
                  <button
                    type="button"
                    onClick={() => onDelete(tpl.id)}
                    aria-label={pm.deleteTemplate}
                    className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 hover:bg-white hover:text-rose-600 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>

                  <button type="button" onClick={() => onApply(tpl)} className="flex flex-1 flex-col text-left cursor-pointer">
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      <span>{templateCategoryIcon(tpl.category)}</span>
                      <span>{templateCategoryLabel(tpl.category, locale)}</span>
                    </span>
                    <h4 className="mt-2 font-display text-sm font-bold text-slate-900 truncate pr-6">{tpl.name}</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-3">{tpl.body}</p>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
