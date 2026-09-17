"use client";

import { useEffect, useState } from "react";
import type { WooCommerceProduct } from "@/lib/woocommerce/client";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  onSelect: (product: WooCommerceProduct) => void;
  onClose: () => void;
};

export default function WooCommerceProductPicker({ onSelect, onClose }: Props) {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = search
          ? `/api/woocommerce/products?search=${encodeURIComponent(search)}`
          : "/api/woocommerce/products";
        const res = await fetch(url);
        const data = await res.json();
        if (ignore) return;
        if (!res.ok) throw new Error(data.error || (isEn ? "Products could not be retrieved." : "Ürünler alınamadı."));
        setProducts(data.products ?? []);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : (isEn ? "Products could not be retrieved." : "Ürünler alınamadı."));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [search, isEn]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <span className="text-sm font-bold text-slate-900">
            {isEn ? "Select WooCommerce Product" : "WooCommerce Ürünü Seç"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close" : "Kapat"}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search products..." : "Ürün ara..."}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-rose-300 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-center text-xs text-slate-400">{isEn ? "Loading..." : "Yükleniyor..."}</p>
          ) : error ? (
            <p className="text-center text-xs text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center text-xs text-slate-400">{isEn ? "No products found." : "Ürün bulunamadı."}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onSelect(product);
                    onClose();
                  }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-2xs transition hover:border-rose-300 hover:shadow-md cursor-pointer"
                >
                  <div className="relative aspect-square w-full bg-slate-100">
                    {product.images?.[0]?.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                        {isEn ? "No image" : "Görsel yok"}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[11px] font-bold text-slate-800">{product.name}</p>
                    {product.price && <p className="text-[10px] font-semibold text-rose-600">{product.price} TL</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
