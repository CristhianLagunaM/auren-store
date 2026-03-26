import type { CatalogProduct } from "@/types/product";

type ProductWithRelations = {
  id: bigint | number;
  sku: string;
  name: string;
  slug: string;
  brand: string | null;
  shortDescription: string | null;
  description: string | null;
  active: boolean;
  featured: boolean;
  prices?: Array<{
    price: number;
    compareAtPrice: number | null;
  }>;
  inventories?: Array<{
    quantityAvailable: number;
  }>;
  images?: Array<{
    publicUrl: string;
  }>;
};

export function toCatalogProduct(product: ProductWithRelations): CatalogProduct {
  return {
    id: Number(product.id),
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    brand: product.brand ?? "Auren",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    price: product.prices?.[0]?.price ?? 0,
    compareAtPrice: product.prices?.[0]?.compareAtPrice ?? 0,
    quantityAvailable: product.inventories?.[0]?.quantityAvailable ?? 0,
    active: product.active,
    featured: product.featured,
    imageUrl: product.images?.[0]?.publicUrl,
  };
}