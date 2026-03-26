import { toCatalogProduct } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const body = await req.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Id inválido" },
        { status: 400 }
      );
    }

    const sku = body.sku != null ? String(body.sku).trim() : undefined;
    const name = body.name != null ? String(body.name).trim() : undefined;
    const slug = body.slug != null ? String(body.slug).trim() : undefined;
    const brand = body.brand != null ? String(body.brand).trim() : undefined;
    const shortDescription =
      body.shortDescription != null
        ? String(body.shortDescription).trim()
        : undefined;
    const description =
      body.description != null ? String(body.description).trim() : undefined;
    const productType =
      body.productType != null ? String(body.productType).trim() : undefined;
    const price =
      body.price != null && body.price !== "" ? Number(body.price) : undefined;
    const compareAtPrice =
      body.compareAtPrice != null && body.compareAtPrice !== ""
        ? Number(body.compareAtPrice)
        : 0;
    const quantityAvailable =
      body.quantityAvailable != null && body.quantityAvailable !== ""
        ? Number(body.quantityAvailable)
        : undefined;
    const active = body.active != null ? Boolean(body.active) : undefined;
    const featured = body.featured != null ? Boolean(body.featured) : undefined;

    if (
      (price != null && isNaN(price)) ||
      isNaN(compareAtPrice) ||
      (quantityAvailable != null && isNaN(quantityAvailable))
    ) {
      return NextResponse.json(
        { success: false, error: "Valores numéricos inválidos" },
        { status: 400 }
      );
    }

    let imageUrl =
      body.imageUrl != null && body.imageUrl !== ""
        ? String(body.imageUrl)
        : undefined;

    if (body.imageFileBase64 && body.imageFileName) {
      if (!supabaseAdmin) {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY no está configurada para subir imágenes"
        );
      }

      const fileName = `auren/${Date.now()}-${String(body.imageFileName)}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("products")
        .upload(fileName, Buffer.from(String(body.imageFileBase64), "base64"), {
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

    const current = await prisma.product.findUnique({
      where: { id },
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
    });

    if (!current) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    await prisma.product.update({
      where: { id },
      data: {
        ...(sku !== undefined ? { sku } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(brand !== undefined ? { brand } : {}),
        ...(shortDescription !== undefined ? { shortDescription } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(productType !== undefined ? { productType } : {}),
        ...(active !== undefined ? { active } : {}),
        ...(featured !== undefined ? { featured } : {}),
      },
    });

    if (price !== undefined) {
      if (current.prices.length > 0) {
        await prisma.productPrice.update({
          where: { id: current.prices[0].id },
          data: {
            price,
            compareAtPrice,
            active: true,
          },
        });
      } else {
        await prisma.productPrice.create({
          data: {
            product_id: id,
            price,
            compareAtPrice,
            currencyCode: "COP",
            active: true,
          },
        });
      }
    }

    if (quantityAvailable !== undefined) {
      if (current.inventories.length > 0) {
        await prisma.inventory.update({
          where: { id: current.inventories[0].id },
          data: {
            quantityAvailable,
            active: true,
          },
        });
      } else {
        await prisma.inventory.create({
          data: {
            product_id: id,
            quantityAvailable,
            active: true,
          },
        });
      }
    }

    if (imageUrl) {
      const primaryImage = current.images.find(
        (img: (typeof current.images)[number]) => img.isPrimary
      );

      if (primaryImage) {
        await prisma.productImage.update({
          where: { id: primaryImage.id },
          data: {
            publicUrl: imageUrl,
            active: true,
          },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: id,
            publicUrl: imageUrl,
            isPrimary: true,
            active: true,
          },
        });
      }
    }

    const refreshed = await prisma.product.findUnique({
      where: { id },
      include: {
        prices: true,
        inventories: true,
        images: true,
      },
    });

    if (!refreshed) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado después de editar" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: toCatalogProduct(refreshed),
    });
  } catch (err) {
    console.error("Error editando producto:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Id inválido" },
        { status: 400 }
      );
    }

    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.inventory.deleteMany({
      where: { product_id: id },
    });

    await prisma.productPrice.deleteMany({
      where: { product_id: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error eliminando producto:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}