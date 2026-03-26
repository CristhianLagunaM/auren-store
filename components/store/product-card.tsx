"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CatalogProduct } from "@/types/product";
import { useCart } from "@/contexts/cart-context";

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <article className="group bg-white rounded-2xl border border-[#ead7d1] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      <Link href={`/productos/${product.slug}`} className="block relative">
        <div className="aspect-square bg-[#f8f1ef] overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[#ead7d1]" />
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#6f4b46] text-white text-xs font-semibold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        {product.featured && !hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#a8746b] text-white text-xs font-semibold px-2 py-1 rounded-full">
            Destacado
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.brand && (
          <span className="text-xs text-[#8d726d] uppercase tracking-wider font-medium">
            {product.brand}
          </span>
        )}
        <Link href={`/productos/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[#3d2c2c] leading-snug line-clamp-2 hover:text-[#6f4b46] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-xs text-[#8d726d] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#6f4b46]">
              {formatCOP(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#8d726d] line-through">
                {formatCOP(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 bg-[#6f4b46] hover:bg-[#5a3c38] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
