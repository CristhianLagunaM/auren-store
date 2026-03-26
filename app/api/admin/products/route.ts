import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { ProductCreateBody } from "@/types/product";
import type { Prisma } from "@prisma/client";
import { toCatalogProduct } from "@/lib/admin-products";

export async function POST(req: Request) {
  try {
    const body: ProductCreateBody & { productType?: string } = await req.json();

    const sku = String(body.sku || "").trim();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const brand = String(body.brand || "Auren").trim();
    const shortDescription = String(body.shortDescription || "").trim();
    const description = String(body.description || "").trim();
    const productType = String(body.productType || "general").trim();
    const price = Number(body.price ?? 0);
    const compareAtPrice = Number(body.compareAtPrice ?? 0);
    const quantityAvailable = Number(body.quantityAvailable ?? 0);
    const active = Boolean(body.active ?? true);
    const featured = Boolean(body.featured ?? false);
    const imageFileBase64 = body.imageFileBase64
      ? String(body.imageFileBase64)
      : undefined;
    const imageFileName = body.imageFileName
      ? String(body.imageFileName)
      : undefined;

    if (!sku || !name || !slug) {
      return NextResponse.json(
        { success: false, error: "SKU, nombre y slug son obligatorios" },
        { status: 400 }
      );
    }

    if (isNaN(price) || isNaN(compareAtPrice) || isNaN(quantityAvailable)) {
      return NextResponse.json(
        { success: false, error: "Valores numéricos inválidos" },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined =
      body.imageUrl != null && body.imageUrl !== ""
        ? String(body.imageUrl).trim()
        : undefined;

    if (imageFileBase64 && imageFileName) {
      if (!supabaseAdmin) {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY no está configurada para subir imágenes"
        );
      }

      const fileName = `auren/${Date.now()}-${imageFileName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("products")
        .upload(fileName, Buffer.from(imageFileBase64, "base64"), {
          upsert: true,
          contentType: "image/*",
        });

      if (uploadError) {
        throw new Error(`Error subiendo imagen: ${uploadError.message}`);
      }

      const publicData = supabaseAdmin.storage
        .from("products")
        .getPublicUrl(fileName);
      imageUrl = publicData.data.publicUrl;
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug,
        brand,
        shortDescription,
        description,
        productType,
        active,
        featured,
        prices: {
          create: [
            {
              price,
              compareAtPrice,
              currencyCode: "COP",
              active: true,
            },
          ],
        },
        inventories: {
          create: [
            {
              quantityAvailable,
              active: true,
            },
          ],
        },
        ...(imageUrl
          ? {
              images: {
                create: [
                  {
                    publicUrl: imageUrl,
                    isPrimary: true,
                    active: true,
                  },
                ],
              },
            }
          : {}),
      } as Prisma.ProductCreateArgs["data"],
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: toCatalogProduct(product),
    });
  } catch (err) {
    console.error("Error creando producto:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}