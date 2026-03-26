"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export function StoreHeader() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[#f8f1ef]/95 backdrop-blur-sm border-b border-[#ead7d1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Auren"
            fill
            sizes="36px"
            className="object-contain"
            priority
          />
          <span className="text-xl font-semibold text-[#6f4b46] tracking-tight">
            Auren
          </span>
        </Link>

        <div className="relative flex items-center gap-4 z-10">
          <Link
            href="/admin"
            className="text-xs text-[#8d726d] hover:text-[#6f4b46] transition-colors"
          >
            Admin
          </Link>

          <button
            onClick={openCart}
            className="relative flex items-center gap-2 text-[#6f4b46] hover:text-[#a8746b] transition-colors cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#6f4b46] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
