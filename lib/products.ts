// lib/products.ts
import type { CatalogProduct } from "@/types/product";
import { prisma } from "@/lib/prisma";

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    // 🔹 Obtener todos los productos con sus relaciones
    const products = await prisma.product.findMany({
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
      orderBy: { id: "desc" },
    });

    // 🔹 Mapear a CatalogProduct
    return products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.prices[0]?.price ?? 0,
      compareAtPrice: p.prices[0]?.compareAtPrice ?? 0,
      quantityAvailable: p.inventories[0]?.quantityAvailable ?? 0,
      active: p.active,
      featured: p.featured,
      imageUrl: p.images[0]?.publicUrl,
    }));
  } catch (err) {
    console.error("Error consultando catálogo:", err);
    throw new Error("No se pudo consultar el catálogo");
  }
}