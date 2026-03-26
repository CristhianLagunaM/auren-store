import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getProductBySlug } from "@/lib/store-products";
import { StoreHeader } from "@/components/store/store-header";
import { AddToCartButton } from "./product-client";

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <main className="min-h-screen bg-[#f8f1ef]">
      <StoreHeader />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[#8d726d] hover:text-[#6f4b46] transition-colors mb-6"
        >
          ← Volver a la tienda
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="bg-white rounded-3xl border border-[#ead7d1] overflow-hidden">
            <div className="relative aspect-square bg-[#f8f1ef]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-[#ead7d1]" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#ead7d1] p-6 sm:p-8">
            {product.brand && (
              <p className="text-xs uppercase tracking-[0.25em] text-[#8d726d] mb-3">
                {product.brand}
              </p>
            )}

            <h1 className="text-3xl sm:text-4xl font-semibold text-[#3d2c2c] tracking-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-4 text-[#6f5a56] leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-[#6f4b46]">
                {formatCOP(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-base text-[#8d726d] line-through">
                  {formatCOP(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {product.description && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8d726d] mb-3">
                  Descripción
                </h2>
                <p className="text-sm sm:text-base text-[#4b3a39] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}