"use client";

import { useState } from "react";
import { HiOutlineLink, HiOutlineCheck } from "react-icons/hi2";
import { FaXTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

interface BlogShareBarProps {
  title: string;
  url: string;
}

export default function BlogShareBar({ title, url }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const shareLinks = [
    {
      name: "X",
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:bg-black hover:text-white border-slate-200 text-slate-700",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:bg-[#0A66C2] hover:text-white border-slate-200 text-slate-700",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`,
      color: "hover:bg-[#25D366] hover:text-white border-slate-200 text-slate-700",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Paylaş:</span>
      {shareLinks.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.name}'de paylaş`}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-sm transition-all duration-200 shadow-2xs hover:scale-105 ${item.color}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Bağlantıyı kopyala"
        className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 shadow-2xs ${
          copied
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        {copied ? (
          <>
            <HiOutlineCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Kopyalandı!</span>
          </>
        ) : (
          <>
            <HiOutlineLink className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Kopyala</span>
          </>
        )}
      </button>
    </div>
  );
}
