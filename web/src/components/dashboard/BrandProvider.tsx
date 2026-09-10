"use client";

import { createContext, useContext } from "react";

export type Brand = { id: string; name: string; timezone: string };

const BrandContext = createContext<Brand | null>(null);

export function BrandProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

/*
  Resolved once, server-side, in (app)/layout.tsx and handed down as context —
  every panel that needs the brand id/timezone reads it from here instead of
  re-running its own membership lookup.
*/
export function useBrand(): Brand {
  const brand = useContext(BrandContext);
  if (!brand) throw new Error("useBrand() must be used inside (app)/layout's BrandProvider");
  return brand;
}
