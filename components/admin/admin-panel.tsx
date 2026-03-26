"use client";

import { useState } from "react";
import type { CatalogProduct } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminPanelProps {
  initialProducts: CatalogProduct[];
}

interface ProductFormState {
  sku: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  description: string;
  price: string;
  compareAtPrice: string;
  quantityAvailable: string;
  active: boolean;
  featured: boolean;
  imageFile?: File;
  imageUrl?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("No se pudo leer el archivo"));
        return;
      }

      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("No se pudo convertir el archivo a base64"));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsDataURL(file);
  });
}

export function AdminPanel({ initialProducts }: AdminPanelProps) {
  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductFormState>({
    sku: "",
    name: "",
    slug: "",
    brand: "Auren",
    shortDescription: "",
    description: "",
    price: "0",
    compareAtPrice: "",
    quantityAvailable: "0",
    active: true,
    featured: false,
    imageFile: undefined,
    imageUrl: undefined,
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      sku: "",
      name: "",
      slug: "",
      brand: "Auren",
      shortDescription: "",
      description: "",
      price: "0",
      compareAtPrice: "",
      quantityAvailable: "0",
      active: true,
      featured: false,
      imageFile: undefined,
      imageUrl: undefined,
    });
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (product: CatalogProduct) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      shortDescription: product.shortDescription,
      description: product.description,
      price: String(product.price ?? 0),
      compareAtPrice:
        product.compareAtPrice != null ? String(product.compareAtPrice) : "",
      quantityAvailable: String(product.quantityAvailable ?? 0),
      active: product.active,
      featured: product.featured,
      imageFile: undefined,
      imageUrl: product.imageUrl,
    });
    setIsDialogOpen(true);
  };

  const saveProduct = async () => {
    try {
      setIsSaving(true);

      const price = Number(form.price || 0);
      const compareAtPrice =
        form.compareAtPrice.trim() !== "" ? Number(form.compareAtPrice) : 0;
      const quantityAvailable = Number(form.quantityAvailable || 0);

      if (!form.sku.trim() || !form.name.trim() || !form.slug.trim()) {
        alert("SKU, nombre y slug son obligatorios");
        return;
      }

      if (
        Number.isNaN(price) ||
        Number.isNaN(compareAtPrice) ||
        Number.isNaN(quantityAvailable)
      ) {
        alert("Precio, precio comparativo y cantidad deben ser números válidos");
        return;
      }

      let imageFileBase64: string | undefined;
      let imageFileName: string | undefined;

      if (form.imageFile) {
        imageFileBase64 = await fileToBase64(form.imageFile);
        imageFileName = form.imageFile.name;
      }

      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        slug: form.slug.trim(),
        brand: form.brand.trim() || "Auren",
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        price,
        compareAtPrice,
        quantityAvailable,
        active: form.active,
        featured: form.featured,
        imageUrl: form.imageUrl,
        imageFileBase64,
        imageFileName,
      };

      const endpoint = editingId
        ? `/api/admin/products/${editingId}`
        : `/api/admin/products`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo guardar el producto");
      }

      const savedProduct: CatalogProduct = data.product;

      if (editingId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? savedProduct : p))
        );
      } else {
        setProducts((prev) => [savedProduct, ...prev]);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error guardando producto:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Ocurrió un error guardando el producto"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      setIsProcessingId(id);

      const res = await fetch(`/api/admin/products/${id}/toggle`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo cambiar el estado");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                active: data.active,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado del producto"
      );
    } finally {
      setIsProcessingId(null);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const confirmed = confirm("¿Deseas eliminar este producto?");
      if (!confirmed) return;

      setIsProcessingId(id);

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo eliminar el producto");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el producto"
      );
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Panel Administrativo</h1>
        <Button onClick={openCreate}>Agregar Producto</Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Producto" : "Crear Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifica los datos del producto"
                : "Agrega un nuevo producto al catálogo de Auren"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />

            <Input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <Input
              placeholder="Marca"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />

            <Input
              placeholder="Descripción corta"
              value={form.shortDescription}
              onChange={(e) =>
                setForm({ ...form, shortDescription: e.target.value })
              }
            />

            <Input
              placeholder="Descripción larga"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <Input
              placeholder="Precio"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <Input
              placeholder="Precio comparativo"
              type="number"
              value={form.compareAtPrice}
              onChange={(e) =>
                setForm({ ...form, compareAtPrice: e.target.value })
              }
            />

            <Input
              placeholder="Cantidad disponible"
              type="number"
              value={form.quantityAvailable}
              onChange={(e) =>
                setForm({ ...form, quantityAvailable: e.target.value })
              }
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
              Activo
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              Destacado
            </label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, imageFile: e.target.files?.[0] })
              }
            />

            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt={form.name || "Vista previa"}
                className="h-24 w-24 rounded object-cover"
              />
            )}

            <Button onClick={saveProduct} className="mt-2" disabled={isSaving}>
              {isSaving
                ? "Guardando..."
                : editingId
                ? "Actualizar"
                : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">Productos</h2>

        <ul className="flex flex-col gap-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 rounded border p-3"
            >
              <div className="flex items-center gap-3">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-xs text-gray-500">
                    Sin imagen
                  </div>
                )}

                <div>
                  <p className="font-bold">{product.name}</p>
                  <p className="text-sm">
                    {product.sku} - {product.brand}
                  </p>
                  <p className="text-sm">{product.price} COP</p>
                  <p className="text-sm">
                    {product.active ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => openEdit(product)}
                  disabled={isProcessingId === product.id}
                >
                  Editar
                </Button>

                <Button
                  onClick={() => deleteProduct(product.id)}
                  disabled={isProcessingId === product.id}
                >
                  Eliminar
                </Button>

                <Button
                  onClick={() => toggleActive(product.id)}
                  disabled={isProcessingId === product.id}
                >
                  {isProcessingId === product.id
                    ? "Procesando..."
                    : product.active
                    ? "Inactivar"
                    : "Activar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}