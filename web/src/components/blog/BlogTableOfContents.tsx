"use client";

import { useEffect, useState } from "react";
import { HiOutlineListBullet } from "react-icons/hi2";

interface TocItem {
  id: string;
  title: string;
}

interface BlogTableOfContentsProps {
  items: TocItem[];
  embedded?: boolean;
}

export default function BlogTableOfContents({ items, embedded = false }: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <div className={embedded ? "" : "max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl border border-[#E3E6E9] bg-white p-5"}>
      <div className="mb-3 flex items-center gap-2 border-b border-[#E3E6E9] pb-3 text-sm font-bold text-[#172B46]">
        <HiOutlineListBullet className="h-4 w-4 text-[#C92E35]" />
        <span>İçindekiler</span>
      </div>

      <nav className="space-y-1" aria-label="Makale içindekiler">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              aria-current={isActive ? "location" : undefined}
              className={`block rounded-md border-l-2 px-3 py-2 text-xs leading-relaxed transition-colors ${
                isActive
                  ? "border-[#FA5252] bg-[#FFF4F1] font-semibold text-[#A5202B]"
                  : "border-transparent text-[#536276] hover:bg-[#FAF9F6] hover:text-[#172B46]"
              }`}
            >
              {item.title}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
