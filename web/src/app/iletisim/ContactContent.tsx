"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineArrowRight,
  HiOutlineQuestionMarkCircle,
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";

export default function ContactContent() {
  const { t, locale } = useLanguage();
  const c = t.contactPage;

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Copy email state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  function copyToClipboard(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2200);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage(
        locale === "tr"
          ? "Lütfen adınızı ve soyadınızı girin."
          : "Please enter your first and last name."
      );
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage(
        locale === "tr"
          ? "Lütfen geçerli bir iş e-postası girin."
          : "Please enter a valid work email address."
      );
      return;
    }

    if (!subject) {
      setErrorMessage(
        locale === "tr"
          ? "Lütfen bir talep konusu seçin."
          : "Please select a topic for your inquiry."
      );
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage(
        locale === "tr"
          ? "Lütfen mesajınızı biraz daha detaylandırın."
          : "Please provide a bit more detail in your message."
      );
      return;
    }

    if (!consent) {
      setErrorMessage(
        locale === "tr"
          ? "Lütfen gizlilik politikası onay kutusunu işaretleyin."
          : "Please accept the privacy policy consent to proceed."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          subject,
          message,
          consent,
          website_hp: honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || c.form.errorGeneric);
      }

      setIsSuccess(true);
      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setConsent(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : c.form.errorGeneric;
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-[#FA5252] selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* =========================================================================
            HERO SPOTLIGHT & HEADER
            ========================================================================= */}
        <section className="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-slate-200/60 bg-gradient-to-b from-white via-[#fbfaf9] to-[#f8f6f3]">
          {/* Subtle background ambient glows */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] rounded-full bg-gradient-to-r from-rose-100/60 via-amber-50/40 to-sky-100/50 blur-3xl opacity-70"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/80 px-3.5 py-1 text-xs font-semibold text-[#FA5252] shadow-2xs backdrop-blur-xs">
                <HiOutlineSparkles className="h-3.5 w-3.5" />
                <span>{c.badge}</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[52px] leading-tight">
                {c.title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA5252] via-[#E03131] to-[#C92E35]">
                  {c.titleHighlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="font-body text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {c.description}
              </p>

              {/* Live response time indicator */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-emerald-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span>{c.responseTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            MAIN 2-COLUMN SECTION: DIRECT CHANNELS (LEFT) + FORM (RIGHT)
            ========================================================================= */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 items-start">
              {/* LEFT COLUMN: DIRECT CONTACT CHANNELS & QUICK GUIDANCE (5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Support Channel Card */}
                <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-[#FA5252]/40 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#FA5252] transition group-hover:scale-105">
                      <HiOutlineEnvelope className="h-6 w-6" />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(c.supportCard.email)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 py-1 transition cursor-pointer"
                      title="E-postayı Kopyala"
                    >
                      {copiedEmail === c.supportCard.email ? (
                        <>
                          <HiOutlineClipboardDocumentCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">
                            {locale === "tr" ? "Kopyalandı" : "Copied"}
                          </span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboardDocument className="h-3.5 w-3.5" />
                          <span>{locale === "tr" ? "Kopyala" : "Copy"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {c.supportCard.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {c.supportCard.desc}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`mailto:${c.supportCard.email}`}
                      className="font-mono text-sm font-semibold text-[#FA5252] hover:text-[#E03131] transition"
                    >
                      {c.supportCard.email}
                    </a>
                    <a
                      href={`mailto:${c.supportCard.email}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 transition"
                    >
                      <span>{c.supportCard.action}</span>
                      <HiOutlineArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Sales Channel Card */}
                <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-[#172B46]/40 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#172B46] transition group-hover:scale-105">
                      <HiOutlineBuildingOffice2 className="h-6 w-6" />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(c.salesCard.email)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 py-1 transition cursor-pointer"
                      title="E-postayı Kopyala"
                    >
                      {copiedEmail === c.salesCard.email ? (
                        <>
                          <HiOutlineClipboardDocumentCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">
                            {locale === "tr" ? "Kopyalandı" : "Copied"}
                          </span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboardDocument className="h-3.5 w-3.5" />
                          <span>{locale === "tr" ? "Kopyala" : "Copy"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {c.salesCard.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {c.salesCard.desc}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`mailto:${c.salesCard.email}`}
                      className="font-mono text-sm font-semibold text-[#172B46] hover:text-slate-700 transition"
                    >
                      {c.salesCard.email}
                    </a>
                    <a
                      href={`mailto:${c.salesCard.email}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 transition"
                    >
                      <span>{c.salesCard.action}</span>
                      <HiOutlineArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* FAQ & Knowledge Quick Pointers */}
                <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-5 space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <HiOutlineQuestionMarkCircle className="h-4 w-4 text-[#FA5252]" />
                    <span>{c.faqNote.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {c.faqNote.desc}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <Link
                      href="/#sss"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:border-[#FA5252]/50 hover:text-[#FA5252] transition shadow-2xs"
                    >
                      <span>{c.faqNote.faqLink}</span>
                      <HiOutlineArrowRight className="h-3 w-3" />
                    </Link>
                    <Link
                      href="/nasil-calisir"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:border-[#FA5252]/50 hover:text-[#FA5252] transition shadow-2xs"
                    >
                      <span>{c.faqNote.howItWorksLink}</span>
                      <HiOutlineArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Working Hours & Remote Mode */}
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <HiOutlineClock className="h-4 w-4 text-slate-500" />
                    <span>{c.office.title}</span>
                  </div>
                  <p className="font-mono text-[12px] text-slate-700 font-medium">
                    {c.office.hours}
                  </p>
                  <p className="text-slate-500">{c.office.mode}</p>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE FORM CARD (7 COLS - SOCIALPILOT STYLE) */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xl shadow-slate-900/5 transition-all">
                  {/* Success State View */}
                  {isSuccess ? (
                    <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                        <HiOutlineCheck className="h-8 w-8 stroke-[2.5]" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold text-slate-900">
                          {c.form.successTitle}
                        </h2>
                        <p className="font-body text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                          {c.form.successDesc}
                        </p>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => setIsSuccess(false)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 font-body text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer"
                        >
                          {c.form.sendAnother}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* The Actual Form */
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      <div className="border-b border-slate-100 pb-4">
                        <h2 className="font-display text-2xl font-bold text-slate-900">
                          {c.form.title}
                        </h2>
                        <p className="mt-1 font-body text-xs sm:text-sm text-slate-500">
                          {c.form.subtitle}
                        </p>
                      </div>

                      {/* Honeypot for bot traps (hidden from view) */}
                      <input
                        type="text"
                        name="website_hp"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      {/* First & Last Name row */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="contact-first-name"
                            className="block font-body text-xs font-semibold text-slate-700"
                          >
                            {c.form.firstName} <span className="text-[#FA5252]">*</span>
                          </label>
                          <input
                            id="contact-first-name"
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={c.form.firstNamePlaceholder}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#FA5252] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FA5252]/20"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="contact-last-name"
                            className="block font-body text-xs font-semibold text-slate-700"
                          >
                            {c.form.lastName} <span className="text-[#FA5252]">*</span>
                          </label>
                          <input
                            id="contact-last-name"
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={c.form.lastNamePlaceholder}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#FA5252] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FA5252]/20"
                          />
                        </div>
                      </div>

                      {/* Work Email & Phone row */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="contact-email"
                            className="block font-body text-xs font-semibold text-slate-700"
                          >
                            {c.form.email} <span className="text-[#FA5252]">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={c.form.emailPlaceholder}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#FA5252] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FA5252]/20"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="contact-phone"
                            className="block font-body text-xs font-semibold text-slate-700"
                          >
                            {c.form.phone}{" "}
                            <span className="text-slate-400 font-normal">
                              {c.form.phoneOptional}
                            </span>
                          </label>
                          <input
                            id="contact-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={c.form.phonePlaceholder}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#FA5252] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FA5252]/20"
                          />
                        </div>
                      </div>

                      {/* Subject dropdown */}
                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="block font-body text-xs font-semibold text-slate-700"
                        >
                          {c.form.subject} <span className="text-[#FA5252]">*</span>
                        </label>
                        <select
                          id="contact-subject"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition focus:border-[#FA5252] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FA5252]/20 cursor-pointer"
                        >
                          <option value="" disabled>
                            {c.form.subjectPlaceholder}
                          </option>
                          {c.form.subjects.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message Textarea */}
                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="contact-message"
                            className="block font-body text-xs font-semibold text-slate-700"
                          >
                            {c.form.message} <span className="text-[#FA5252]">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {message.length} / 5000
                          </span>
                        </div>
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          maxLength={5000}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={c.form.messagePlaceholder}
                          className="mt-1.5 block w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#FA5252] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FA5252]/20"
                        />
                      </div>

                      {/* Error Alert */}
                      {errorMessage && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in">
                          {errorMessage}
                        </div>
                      )}

                      {/* Privacy Consent Checkbox */}
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          id="contact-consent"
                          type="checkbox"
                          required
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-[#FA5252] focus:ring-[#FA5252] cursor-pointer"
                        />
                        <label
                          htmlFor="contact-consent"
                          className="text-[12px] leading-snug text-slate-600 select-none cursor-pointer"
                        >
                          {c.form.consentText}{" "}
                          <Link
                            href="/gizlilik"
                            target="_blank"
                            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-[#FA5252]"
                          >
                            {c.form.consentLinkText}
                          </Link>{" "}
                          {c.form.consentTextSuffix}
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FA5252] px-6 py-3.5 font-body text-sm font-bold text-white shadow-md shadow-[#FA5252]/25 transition hover:bg-[#E03131] hover:shadow-lg hover:shadow-[#FA5252]/30 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="h-4 w-4 animate-spin text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>{c.form.submitting}</span>
                            </>
                          ) : (
                            <>
                              <span>{c.form.submit}</span>
                              <HiOutlineArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-center text-[11px] text-slate-400">
                        {c.form.privacyNotice}
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM TRUST & TRIAL STRIP (SOCIALPILOT INSPIRED)
            ========================================================================= */}
        <section className="border-t border-slate-200/80 bg-gradient-to-r from-[#172B46] via-[#1b3457] to-[#172B46] text-white py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {c.bottomBanner.title}
            </h2>

            {/* 3 Trust Perks */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-200 font-medium">
              {c.bottomBanner.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <HiOutlineCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Trial CTA */}
            <div className="pt-2">
              <Link
                href="/kayit"
                className="inline-flex items-center gap-2 rounded-full bg-[#FA5252] px-7 py-3 font-body text-sm font-bold text-white shadow-lg shadow-[#FA5252]/30 transition hover:bg-[#E03131] hover:scale-105 active:scale-95"
              >
                <span>{c.bottomBanner.cta}</span>
                <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
