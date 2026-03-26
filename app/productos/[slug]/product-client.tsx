"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { CatalogProduct } from "@/types/product";
import { useCart } from "@/contexts/cart-context";

export function AddToCartButton({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${
        added
          ? "bg-[#7b9b78] text-white"
          : "bg-[#6f4b46] hover:bg-[#5a3c38] text-white hover:shadow-md active:scale-95"
      }`}
    >
      {added ? (
        <>
          <Check className="w-5 h-5" />
          ¡Agregado al carrito!
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          Agregar al carrito
        </>
      )}
    </button>
  );
}
