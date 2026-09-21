"use client";

import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  HiOutlineSparkles,
  HiOutlineKey,
  HiOutlineCommandLine,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
  HiOutlineLockClosed,
  HiOutlineCpuChip,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const MCP_RESOURCE_URL = "https://tentamark.com/api/mcp";

function configSnippet() {
  return JSON.stringify(
    {
      mcpServers: {
        tentamark: {
          command: "npx",
          args: ["mcp-remote", MCP_RESOURCE_URL, "--header", "Authorization: Bearer <TOKEN>"],
        },
      },
    },
    null,
    2
  );
}

const TRUST_ICONS = [HiOutlineLockClosed, HiOutlineArrowPath, HiOutlineKey, HiOutlineShieldCheck];

function DevelopersContent() {
  const { t } = useLanguage();
  const copy = t.pages.developers;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-accent selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden pt-14 pb-14 sm:pt-18 sm:pb-16 lg:pt-20 lg:pb-20">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(109,79,235,0.12),rgba(250,82,82,0.08),transparent_70%)]"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text shadow-xs">
              <HiOutlineSparkles className="h-3.5 w-3.5 text-accent" />
              {copy.eyebrow}
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {copy.titleBefore}
              <span className="spectrum-text">{copy.titleHighlight}</span>
              {copy.titleAfter}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl font-body text-base text-muted sm:text-lg">{copy.description}</p>

            <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs text-muted shadow-xs">
              <span className="text-faint">{copy.resourceUrlLabel}</span>
              <code className="font-semibold text-ink">{MCP_RESOURCE_URL}</code>
            </div>
          </div>
        </section>

        {/* ================= CONNECT METHODS ================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{copy.connectTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{copy.connectDescription}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="lift rounded-2xl border border-line bg-surface p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle border border-accent/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-text">
                {copy.oauth.badge}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{copy.oauth.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{copy.oauth.description}</p>
            </div>

            <div className="lift rounded-2xl border border-line bg-surface p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft border border-line px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                <HiOutlineCommandLine className="h-3.5 w-3.5" />
                {copy.pat.badge}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{copy.pat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{copy.pat.description}</p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-[#0b0f1a] shadow-lg">
            <p className="border-b border-white/10 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {copy.configLabel}
            </p>
            <pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed text-emerald-50">{configSnippet()}</pre>
          </div>
        </section>

        {/* ================= SCOPES ================= */}
        <section className="border-t border-line bg-surface-soft/40 py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{copy.scopesTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{copy.scopesDescription}</p>

            <div className="mt-8 grid gap-4">
              {copy.scopeGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-start">
                  <span className="w-28 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-faint">{group.label}</span>
                  <div className="flex-1 space-y-2.5">
                    {group.scopes.map((scope) => (
                      <div key={scope.id} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                        <code className="shrink-0 rounded-md bg-accent-subtle px-2 py-0.5 font-mono text-[11px] font-bold text-accent-text">
                          {scope.id}
                        </code>
                        <span className="text-sm text-muted">{scope.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TOOLS ================= */}
        <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{copy.toolsTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{copy.toolsDescription}</p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-faint">{copy.readToolsLabel} (7)</p>
              <div className="space-y-3">
                {copy.tools.slice(0, 7).map((tool) => (
                  <div key={tool.name} className="rounded-xl border border-line bg-surface p-4">
                    <code className="font-mono text-[13px] font-bold text-ink">{tool.name}</code>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-faint">{copy.writeToolsLabel} (6)</p>
              <div className="space-y-3">
                {copy.tools.slice(7).map((tool) => (
                  <div key={tool.name} className="rounded-xl border border-line bg-surface p-4">
                    <code className="font-mono text-[13px] font-bold text-ink">{tool.name}</code>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= TRUST ================= */}
        <section className="border-t border-line bg-surface-soft/40 py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{copy.trustTitle}</h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {copy.trust.map((item, i) => {
                const Icon = TRUST_ICONS[i] ?? HiOutlineCpuChip;
                return (
                  <div key={item.title} className="lift rounded-2xl border border-line bg-surface p-6">
                    <Icon className="h-6 w-6 text-accent" />
                    <h3 className="mt-3 font-display text-base font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{copy.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted sm:text-base">{copy.ctaDescription}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/kayit"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-md shadow-accent/25 transition-all hover:bg-accent-hover"
            >
              {copy.ctaPrimary}
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/nasil-calisir"
              className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              {copy.ctaSecondary}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <LanguageProvider>
      <DevelopersContent />
    </LanguageProvider>
  );
}
