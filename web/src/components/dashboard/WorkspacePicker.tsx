"use client";

import { useState } from "react";
import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlineLockClosed } from "react-icons/hi2";
import type { Workspace } from "@/lib/brand";
import { switchActiveWorkspace, createWorkspace } from "@/lib/brand/workspaceActions";
import { useLanguage } from "@/context/LanguageContext";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function WorkspacePicker({
  workspaces,
  isOwner,
  maxBrands,
  ownedWorkspaceCount,
}: {
  workspaces: Workspace[];
  isOwner: boolean;
  maxBrands: number;
  ownedWorkspaceCount: number;
}) {
  const { t } = useLanguage();
  const w8 = t.dashboard.workspaces;

  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const atLimit = ownedWorkspaceCount >= maxBrands;

  async function handleEnter(w: Workspace) {
    setError(null);
    setSwitchingId(w.id);

    if (!w.isActive) {
      const result = await switchActiveWorkspace(w.id);
      if (result.error) {
        setError(result.error);
        setSwitchingId(null);
        return;
      }
    }

    // Every brand-scoped query in the app shell (layout.tsx and every
    // dashboard page) is re-derived per request, so a hard reload is the
    // simplest way to guarantee nothing stale from the old workspace lingers
    // — same reasoning UserProfileDropdown already uses for sign-out.
    // Straight to Calendar, not the bare /dashboard gate — that gate would
    // just see 2+ workspaces again and bounce right back here.
    window.location.assign("/dashboard/calendar");
  }

  async function handleCreate() {
    if (!newName.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await createWorkspace(newName.trim());
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    window.location.assign("/dashboard/calendar");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {w8.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">{w8.pageSubtitle}</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {workspaces.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => handleEnter(w)}
            disabled={switchingId === w.id}
            className={`group relative flex aspect-square flex-col items-start justify-between rounded-[22px] border p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition cursor-pointer hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-wait disabled:opacity-60 ${
              w.isActive ? "border-slate-900 bg-white" : "border-slate-100 bg-white hover:border-slate-300"
            }`}
          >
            {w.isActive && (
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                <HiOutlineCheckCircle className="h-3 w-3" />
                {w8.active}
              </span>
            )}

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 font-bold text-sm text-white">
              {initials(w.name)}
            </div>

            <div className="min-w-0 w-full">
              <h3 className="font-display text-sm font-bold text-slate-900 truncate">{w.name}</h3>
              {w.organizationName && (
                <p className="text-[11px] text-slate-400 truncate">{w.organizationName}</p>
              )}
              <p className="mt-1 text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 transition">
                {switchingId === w.id ? w8.entering : w8.enter}
              </p>
            </div>
          </button>
        ))}

        {/* + New Workspace — only the org owner can create one, since
            this is what a pricing tier will eventually meter. */}
        {isOwner && !atLimit && !creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-slate-200 p-4 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50/70 transition cursor-pointer"
          >
            <HiOutlinePlus className="h-6 w-6" />
            <span className="text-xs font-bold">{w8.newWorkspace}</span>
          </button>
        )}

        {isOwner && !atLimit && creating && (
          <div className="flex aspect-square flex-col justify-center rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <label className="text-xs font-bold text-slate-700">{w8.brandNameLabel}</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder={w8.brandNamePlaceholder}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim() || submitting}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? w8.creating : w8.create}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                }}
                disabled={submitting}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
              >
                {w8.cancel}
              </button>
            </div>
          </div>
        )}

        {isOwner && atLimit && (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[22px] border border-slate-100 bg-slate-50/70 p-4 text-center">
            <HiOutlineLockClosed className="h-5 w-5 text-slate-400" />
            <p className="text-[11px] font-semibold text-slate-500">
              {w8.planLimitPrefix} {maxBrands} {w8.planLimitSuffix}
            </p>
            <button
              type="button"
              disabled
              className="rounded-xl bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500 cursor-not-allowed"
            >
              {w8.upgradePlan}
            </button>
          </div>
        )}
      </div>

      {!isOwner && (
        <p className="text-[11px] text-slate-400 italic">{w8.ownerOnlyMessage}</p>
      )}
    </div>
  );
}
