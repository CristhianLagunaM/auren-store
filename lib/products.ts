import type { CatalogProduct } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { toCatalogProduct } from "@/lib/admin-products";

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
      orderBy: { id: "desc" },
    });

    return products.map((product) => toCatalogProduct(product));
  } catch (err) {
    console.error("Error consultando catálogo:", err);
    throw new Error("No se pudo consultar el catálogo");
  }
}