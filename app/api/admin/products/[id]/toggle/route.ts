import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
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

    const current = await prisma.product.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { active: !current.active },
    });

    return NextResponse.json({
      success: true,
      active: product.active,
    });
  } catch (err) {
    console.error("Error toggling producto:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}