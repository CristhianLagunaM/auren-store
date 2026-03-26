"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { CatalogProduct } from "@/types/product";
import { ProductCard } from "@/components/store/product-card";
import { ShoppingBag, Search, X } from "lucide-react";

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.05 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

interface StoreFrontProps {
  products: CatalogProduct[];
}

export function StoreFront({ products }: StoreFrontProps) {
  const [activeCategory, setActiveCategory] = useState<string>("todo");
  const [query, setQuery] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  const categories = useMemo(() => {
    const types = products
      .map((p) => p.productType)
      .filter((t): t is string => !!t && t.trim() !== "");
    return ["todo", ...Array.from(new Set(types))];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "todo") {
      result = result.filter((p) => p.productType === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.shortDescription ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, query]);

  const featured = products.filter((p) => p.featured);
  const hasCategories = categories.length > 1;
  const isFiltering = query.trim() !== "" || activeCategory !== "todo";

  return (
    <section
      id="catalogo"
      ref={sectionRef}
      className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14"
    >
      {/* Barra de búsqueda + filtros — siempre visible */}
      <div className="mb-10 rounded-3xl border border-[#ead7d1] bg-white p-4 sm:p-5 shadow-sm space-y-4">
        {/* Input de búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#b9877d]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, marca o descripción…"
            className="w-full rounded-2xl border border-[#ead7d1] bg-[#fdf8f7] py-3 pl-11 pr-10 text-sm text-[#3d2c2c] placeholder-[#c4a8a3] outline-none transition focus:border-[#b07c75] focus:ring-2 focus:ring-[#ead7d1]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9877d] hover:text-[#6f4b46] transition-colors cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filtros de categoría */}
        {hasCategories && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#6f4b46] text-white shadow-sm"
                    : "bg-[#fdf8f7] border border-[#ead7d1] text-[#6f5a56] hover:border-[#b9877d] hover:text-[#6f4b46]"
                }`}
              >
                {cat === "todo"
                  ? "Todo"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destacados — solo si no hay búsqueda ni filtro activo */}
      {featured.length > 0 && !isFiltering && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#ead7d1]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#8d726d] font-medium">
              Destacados
            </span>
            <div className="h-px flex-1 bg-[#ead7d1]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featured.slice(0, 4).map((product, i) => (
              <div
                key={product.id}
                className={inView ? "animate-fade-in-up" : "opacity-0"}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encabezado del catálogo */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#3d2c2c] tracking-tight">
            {query.trim()
              ? `Resultados para "${query}"`
              : activeCategory === "todo"
              ? "Todo el catálogo"
              : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          </h2>
          <p className="text-sm text-[#8d726d] mt-0.5">
            {filtered.length}{" "}
            {filtered.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        {isFiltering && (
          <button
            onClick={() => { setQuery(""); setActiveCategory("todo"); }}
            className="text-xs text-[#8d726d] hover:text-[#6f4b46] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid de productos */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#ead7d1] bg-white py-20 text-center">
          <ShoppingBag className="mb-4 size-10 text-[#ead7d1]" />
          <p className="font-medium text-[#3d2c2c]">Sin resultados</p>
          <p className="mt-1 text-sm text-[#8d726d]">
            Intenta con otro término o categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className={inView ? "animate-fade-in-up" : "opacity-0"}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
