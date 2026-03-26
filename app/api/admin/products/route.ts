import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { ProductCreateBody } from "@/types/product";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body: ProductCreateBody = await req.json();

    // 🔹 Convertir explícitamente a tipos correctos y hacer trim
    const sku = String(body.sku || "").trim();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const brand = String(body.brand || "Auren").trim();
    const shortDescription = String(body.shortDescription || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price ?? 0);
    const compareAtPrice = Number(body.compareAtPrice ?? 0);
    const quantityAvailable = Number(body.quantityAvailable ?? 0);
    const active = Boolean(body.active ?? true);
    const featured = Boolean(body.featured ?? false);
    const imageFileBase64 = body.imageFileBase64 ? String(body.imageFileBase64) : undefined;
    const imageFileName = body.imageFileName ? String(body.imageFileName) : undefined;

    // 🔹 Validar números
    if (isNaN(price) || isNaN(compareAtPrice) || isNaN(quantityAvailable)) {
      return NextResponse.json(
        { success: false, error: "Valores numéricos inválidos" },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;

    // 🔹 Subir imagen a Supabase Storage si existe
    if (imageFileBase64 && imageFileName) {
      const fileName = `auren/${Date.now()}-${imageFileName}`;
      const { error: uploadError } = await supabase
        .storage
        .from("products")
        .upload(fileName, Buffer.from(imageFileBase64, "base64"), { upsert: true });

      if (uploadError) throw uploadError;

      // 🔹 Obtener URL pública correctamente
      const publicData = supabase.storage.from("products").getPublicUrl(fileName);
      imageUrl = publicData.data.publicUrl; // ✅ acceder correctamente
    }

    // 🔹 Crear producto con nested relations
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug,
        brand,
        shortDescription,
        description,
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
      } as Prisma.ProductCreateArgs["data"], // ⚠️ cast explícito para TS
      include: { prices: true, inventories: true, images: true },
    });

    return NextResponse.json({ success: true, productId: product.id, imageUrl });
  } catch (err) {
    console.error("Error creando producto:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}