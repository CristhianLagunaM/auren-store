"use client";

import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

const WHATSAPP_NUMBER = "573102536848";

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildWhatsAppUrl(
  items: { product: { name: string; price: number }; quantity: number }[],
  total: number
): string {
  const lines = items.map(
    (i) =>
      `• ${i.product.name} x${i.quantity} — ${formatCOP(i.product.price * i.quantity)}`
  );

  const message = [
    "¡Hola! Me gustaría hacer el siguiente pedido:",
    "",
    ...lines,
    "",
    `*Total: ${formatCOP(total)}*`,
    "",
    "¿Me pueden ayudar a finalizarlo? 😊",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function CartDrawer() {
  const { items, isOpen, totalItems, totalPrice, removeItem, updateQuantity, clearCart, closeCart } =
    useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ead7d1]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6f4b46]" />
            <h2 className="text-base font-semibold text-[#3d2c2c]">
              Mi carrito
              {totalItems > 0 && (
                <span className="ml-2 text-xs font-normal text-[#8d726d]">
                  ({totalItems} {totalItems === 1 ? "producto" : "productos"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="text-[#8d726d] hover:text-[#6f4b46] transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-16 h-16 text-[#ead7d1]" />
              <p className="text-[#8d726d] text-sm">
                Tu carrito está vacío.
                <br />
                ¡Agrega productos para empezar!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 pb-4 border-b border-[#ead7d1] last:border-0"
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f8f1ef] shrink-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[#ead7d1]" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3d2c2c] line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    {product.brand && (
                      <p className="text-xs text-[#8d726d] mt-0.5">{product.brand}</p>
                    )}
                    <p className="text-sm font-bold text-[#6f4b46] mt-1">
                      {formatCOP(product.price * quantity)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 border border-[#ead7d1] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#6f4b46] hover:bg-[#f8f1ef] transition-colors cursor-pointer"
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-[#3d2c2c]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#6f4b46] hover:bg-[#f8f1ef] transition-colors cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-[#c97f78] hover:text-[#a0524c] transition-colors cursor-pointer"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#ead7d1] px-5 py-5 flex flex-col gap-4 bg-[#f8f1ef]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8d726d]">Subtotal</span>
              <span className="text-lg font-bold text-[#6f4b46]">
                {formatCOP(totalPrice)}
              </span>
            </div>

            <p className="text-xs text-[#8d726d] text-center leading-relaxed">
              El precio final y el envío serán confirmados vía WhatsApp.
            </p>

            <a
              href={buildWhatsAppUrl(items, totalPrice)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Finalizar pedido por WhatsApp
            </a>

            <button
              onClick={clearCart}
              className="text-xs text-[#8d726d] hover:text-[#c97f78] transition-colors cursor-pointer text-center"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
