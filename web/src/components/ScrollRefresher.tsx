"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

export default function ScrollRefresher() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh);
    }

    const t = setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
    };
  }, []);

  return null;
}
