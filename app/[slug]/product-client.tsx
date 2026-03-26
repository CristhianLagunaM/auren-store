"use client";

import { ShoppingBag } from "lucide-react";
import type { CatalogProduct } from "@/types/product";
import { useCart } from "@/contexts/cart-context";

export function AddToCartButton({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem(product)}
      className="inline-flex items-center justify-center gap-2 bg-[#6f4b46] hover:bg-[#5a3c38] text-white font-semibold px-6 py-3.5 rounded-2xl transition-colors cursor-pointer"
    >
      <ShoppingBag className="w-5 h-5" />
      Agregar al carrito
    </button>
  );
}