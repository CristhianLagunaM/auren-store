import type { CatalogProduct } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { toCatalogProduct } from "@/lib/admin-products";

export async function getStoreProducts(): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
      orderBy: [{ featured: "desc" }, { id: "desc" }],
    });

    return products.map((product) => toCatalogProduct(product));
  } catch (err) {
    console.error("Error consultando tienda:", err);
    throw new Error("No se pudo cargar el catálogo");
  }
}

export async function getProductBySlug(
  slug: string
): Promise<CatalogProduct | null> {
  try {
    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
    });

    if (!product) return null;
    return toCatalogProduct(product);
  } catch (err) {
    console.error("Error consultando producto:", err);
    return null;
  }
}
