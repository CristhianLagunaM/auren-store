import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag, ArrowLeft, Tag, Package, Star } from "lucide-react";
import { getProductBySlug, getStoreProducts } from "@/lib/store-products";
import { StoreHeader } from "@/components/store/store-header";
import { AddToCartButton } from "./product-client";
import { ProductCard } from "@/components/store/product-card";

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getStoreProducts(),
  ]);

  if (!product) notFound();

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  // Productos relacionados: misma categoría, excluyendo el actual
  const related = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.productType === product.productType || p.brand === product.brand)
    )
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f8f1ef]">
      <StoreHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#8d726d]">
          <Link href="/" className="flex items-center gap-1.5 hover:text-[#6f4b46] transition-colors">
            <ArrowLeft className="size-4" />
            Tienda
          </Link>
          {product.productType && (
            <>
              <span>/</span>
              <span className="capitalize">{product.productType}</span>
            </>
          )}
          <span>/</span>
          <span className="text-[#3d2c2c] font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Imagen */}
          <div className="animate-fade-in sticky top-24">
            <div className="relative overflow-hidden rounded-3xl border border-[#ead7d1] bg-white shadow-sm">
              <div className="relative aspect-square bg-[#f8f1ef]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="size-16 text-[#ead7d1]" />
                  </div>
                )}
              </div>

              {/* Badges sobre la imagen */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="rounded-full bg-[#6f4b46] px-3 py-1 text-xs font-bold text-white shadow">
                    -{discountPct}% OFF
                  </span>
                )}
                {product.featured && (
                  <span className="flex items-center gap-1 rounded-full bg-[#b9877d] px-3 py-1 text-xs font-bold text-white shadow">
                    <Star className="size-3" />
                    Destacado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="animate-fade-in-up space-y-6" style={{ animationDelay: "0.1s" }}>
            <div className="rounded-3xl border border-[#ead7d1] bg-white p-6 sm:p-8 shadow-sm">
              {product.brand && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8d726d]">
                  {product.brand}
                </p>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-[#3d2c2c] tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="mt-4 text-base text-[#6f5a56] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Precio */}
              <div className="mt-6 flex items-end gap-3">
                <span className="text-4xl font-bold text-[#6f4b46]">
                  {formatCOP(product.price)}
                </span>
                {hasDiscount && (
                  <div className="flex flex-col">
                    <span className="text-sm text-[#8d726d] line-through">
                      {formatCOP(product.compareAtPrice!)}
                    </span>
                    <span className="text-xs text-[#7b9b78] font-semibold">
                      Ahorras {formatCOP(product.compareAtPrice! - product.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Stock */}
              {product.quantityAvailable > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full bg-[#7b9b78]" />
                  <span className="text-xs text-[#6f5a56]">
                    {product.quantityAvailable <= 5
                      ? `Solo quedan ${product.quantityAvailable} unidades`
                      : "En stock"}
                  </span>
                </div>
              )}

              {/* Botón agregar */}
              <div className="mt-8">
                <AddToCartButton product={product} />
              </div>
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="rounded-3xl border border-[#ead7d1] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#8d726d]">
                  <Package className="size-4" />
                  Descripción
                </h2>
                <p className="text-sm sm:text-base text-[#4b3a39] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Detalles */}
            {(product.productType || product.sku) && (
              <div className="rounded-3xl border border-[#ead7d1] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#8d726d]">
                  <Tag className="size-4" />
                  Detalles del producto
                </h2>
                <dl className="space-y-2 text-sm">
                  {product.sku && (
                    <div className="flex justify-between">
                      <dt className="text-[#8d726d]">SKU</dt>
                      <dd className="font-medium text-[#3d2c2c]">{product.sku}</dd>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex justify-between">
                      <dt className="text-[#8d726d]">Marca</dt>
                      <dd className="font-medium text-[#3d2c2c]">{product.brand}</dd>
                    </div>
                  )}
                  {product.productType && (
                    <div className="flex justify-between">
                      <dt className="text-[#8d726d]">Categoría</dt>
                      <dd className="font-medium capitalize text-[#3d2c2c]">{product.productType}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-[#ead7d1]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#8d726d] font-medium">
                También te puede gustar
              </span>
              <div className="h-px flex-1 bg-[#ead7d1]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
