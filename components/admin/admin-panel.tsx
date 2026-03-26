"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogoutButton } from "@/components/admin/logout-button";
import type { CatalogProduct } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Boxes,
  ImageIcon,
  Tag,
  BadgeDollarSign,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Archive,
  WandSparkles,
  CheckCircle2,
  AlertCircle,
  X,
  TriangleAlert,
  UploadCloud,
  ImagePlus,
} from "lucide-react";

interface AdminPanelProps {
  initialProducts: CatalogProduct[];
}

interface ProductFormState {
  codigo: string;
  nombre: string;
  enlace: string;
  marca: string;
  descripcionCorta: string;
  descripcion: string;
  precio: string;
  precioAnterior: string;
  stock: string;
  visible: boolean;
  destacado: boolean;
  imageFile?: File;
  imageUrl?: string;
}

type StatusFilter = "all" | "active" | "inactive";
type SortOption =
  | "recent"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-desc";

type ToastType = "success" | "error" | "info";

interface ToastState {
  open: boolean;
  type: ToastType;
  title: string;
  message?: string;
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
        reject(new Error("No se pudo convertir el archivo"));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsDataURL(file);
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  if (!toast.open) return null;

  const styles =
    toast.type === "success"
      ? {
        icon: <CheckCircle2 className="size-5 text-[#7b9b78]" />,
        box: "border-[#dbe8d8] bg-[#f7fbf6]",
        title: "text-[#4f6a4d]",
        text: "text-[#688066]",
      }
      : toast.type === "error"
        ? {
          icon: <AlertCircle className="size-5 text-[#c97f78]" />,
          box: "border-[#efd2ce] bg-[#fff7f6]",
          title: "text-[#8d534c]",
          text: "text-[#a06a63]",
        }
        : {
          icon: <AlertCircle className="size-5 text-[#a87a72]" />,
          box: "border-[#ead7d1] bg-[#fffaf8]",
          title: "text-[#6f4b46]",
          text: "text-[#8d726d]",
        };

  return (
    <div className="fixed top-5 right-5 z-[120] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`rounded-2xl border p-4 shadow-[0_18px_50px_rgba(120,80,70,0.16)] backdrop-blur ${styles.box}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{styles.icon}</div>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold ${styles.title}`}>{toast.title}</p>
            {toast.message ? (
              <p className={`mt-1 text-sm ${styles.text}`}>{toast.message}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#a0857f] transition hover:bg-black/5"
            aria-label="Cerrar notificación"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({ initialProducts }: AdminPanelProps) {
  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CatalogProduct | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showToast = (type: ToastType, title: string, message?: string) => {
    setToast({ open: true, type, title, message });
  };

  useEffect(() => {
    if (!toast.open) return;
    const timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3200);
    return () => clearTimeout(timeout);
  }, [toast.open]);

  const [form, setForm] = useState<ProductFormState>({
    codigo: "",
    nombre: "",
    enlace: "",
    marca: "Auren",
    descripcionCorta: "",
    descripcion: "",
    precio: "0",
    precioAnterior: "",
    stock: "0",
    visible: true,
    destacado: false,
    imageFile: undefined,
    imageUrl: undefined,
  });

  useEffect(() => {
    if (!form.imageFile) {
      setImagePreview(form.imageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(form.imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.imageFile, form.imageUrl]);

  const resetForm = () => {
    setEditingId(null);
    setImagePreview(undefined);
    setIsDragging(false);
    setForm({
      codigo: "",
      nombre: "",
      enlace: "",
      marca: "Auren",
      descripcionCorta: "",
      descripcion: "",
      precio: "0",
      precioAnterior: "",
      stock: "0",
      visible: true,
      destacado: false,
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
      codigo: product.sku,
      nombre: product.name,
      enlace: product.slug,
      marca: product.brand,
      descripcionCorta: product.shortDescription,
      descripcion: product.description,
      precio: String(product.price ?? 0),
      precioAnterior:
        product.compareAtPrice != null ? String(product.compareAtPrice) : "",
      stock: String(product.quantityAvailable ?? 0),
      visible: product.active,
      destacado: product.featured,
      imageFile: undefined,
      imageUrl: product.imageUrl,
    });
    setImagePreview(product.imageUrl);
    setIsDialogOpen(true);
  };

  const handleSelectedFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast(
        "error",
        "Archivo no válido",
        "Selecciona una imagen en formato válido."
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFile: file,
    }));
    showToast("success", "Imagen cargada", "La vista previa fue actualizada.");
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesText =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.active) ||
        (statusFilter === "inactive" && !product.active);

      return matchesText && matchesStatus;
    });

    switch (sortBy) {
      case "name-asc":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "stock-desc":
        return [...filtered].sort(
          (a, b) => b.quantityAvailable - a.quantityAvailable
        );
      default:
        return [...filtered].sort((a, b) => b.id - a.id);
    }
  }, [products, search, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const inactive = total - active;
    const featured = products.filter((p) => p.featured).length;
    return { total, active, inactive, featured };
  }, [products]);

  const saveProduct = async () => {
    try {
      setIsSaving(true);

      const price = Number(form.precio || 0);
      const compareAtPrice =
        form.precioAnterior.trim() !== "" ? Number(form.precioAnterior) : 0;
      const quantityAvailable = Number(form.stock || 0);

      if (!form.codigo.trim() || !form.nombre.trim() || !form.enlace.trim()) {
        showToast(
          "error",
          "Faltan datos obligatorios",
          "Completa el código, el nombre y el nombre para la URL."
        );
        return;
      }

      if (
        Number.isNaN(price) ||
        Number.isNaN(compareAtPrice) ||
        Number.isNaN(quantityAvailable)
      ) {
        showToast(
          "error",
          "Datos inválidos",
          "Precio, precio anterior y stock deben ser números válidos."
        );
        return;
      }

      let imageFileBase64: string | undefined;
      let imageFileName: string | undefined;

      if (form.imageFile) {
        imageFileBase64 = await fileToBase64(form.imageFile);
        imageFileName = form.imageFile.name;
      }

      const payload = {
        sku: form.codigo.trim(),
        name: form.nombre.trim(),
        slug: form.enlace.trim(),
        brand: form.marca.trim() || "Auren",
        shortDescription: form.descripcionCorta.trim(),
        description: form.descripcion.trim(),
        price,
        compareAtPrice,
        quantityAvailable,
        active: form.visible,
        featured: form.destacado,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo guardar el producto.");
      }

      const savedProduct: CatalogProduct = data.product;

      if (editingId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? savedProduct : p))
        );
        showToast(
          "success",
          "Producto actualizado",
          "Los cambios se guardaron correctamente."
        );
      } else {
        setProducts((prev) => [savedProduct, ...prev]);
        showToast(
          "success",
          "Producto creado",
          "El producto fue agregado al catálogo."
        );
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error guardando producto:", err);
      showToast(
        "error",
        "No se pudo guardar",
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
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
        throw new Error(data.error || "No se pudo cambiar el estado.");
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

      showToast(
        "success",
        data.active ? "Producto visible" : "Producto oculto",
        data.active
          ? "El producto ahora se muestra en la tienda."
          : "El producto ya no se muestra en la tienda."
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      showToast(
        "error",
        "No se pudo cambiar el estado",
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsProcessingId(null);
    }
  };

  const deleteProduct = async () => {
    if (!deleteTarget) return;

    try {
      setIsProcessingId(deleteTarget.id);

      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo eliminar el producto.");
      }

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(
        "success",
        "Producto eliminado",
        `"${deleteTarget.name}" fue eliminado correctamente.`
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error eliminando producto:", err);
      showToast(
        "error",
        "No se pudo eliminar",
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f1ef]">
      <Toast
        toast={toast}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <Card className="overflow-hidden border-[#ead7d1] bg-[linear-gradient(135deg,#fffaf8_0%,#f8ece8_38%,#f3e2de_100%)] shadow-[0_16px_40px_rgba(166,121,109,0.16)]">
          <CardContent className="p-0">
            <div className="grid items-center gap-8 px-6 py-8 md:px-8 lg:grid-cols-[220px_1fr_auto] lg:py-10">
              <div className="flex justify-center lg:justify-start">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] border border-[#ecd7d0] bg-white/85 shadow-[0_18px_40px_rgba(130,95,86,0.12)]">
                  <div className="relative h-36 w-36">
                    <Image
                      src="/logo.png"
                      alt="Auren"
                      fill
                      sizes="36px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7d3cc] bg-white/75 px-3 py-1.5 text-xs font-medium text-[#8b5e57]">
                  <WandSparkles className="size-3.5" />
                  Panel de administración
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-[#6f4b46] md:text-5xl">
                  Auren
                </h1>

                <p className="mt-2 text-lg italic text-[#9b6d66] md:text-xl">
                  Belleza serena, estilo eterno.
                </p>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7f6661] md:text-base">
                  Gestiona tu catálogo con una experiencia más elegante, visual y
                  ordenada. Crea productos, edítalos, controla su visibilidad y
                  mantén tu tienda alineada con la identidad de Auren.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 lg:items-end">
                <Button
                  onClick={openCreate}
                  size="lg"
                  className="h-12 border-0 bg-[#b9877d] px-6 text-white shadow-sm hover:bg-[#a8746b]"
                >
                  <Plus className="size-4" />
                  Nuevo producto
                </Button>
                <LogoutButton />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-[#ecd8d2] bg-white/80 shadow-sm">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-[#8e726d]">Productos registrados</p>
                <p className="mt-1 text-2xl font-semibold text-[#6f4b46]">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5e7e2] p-3 text-[#a56e64]">
                <Boxes className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#ecd8d2] bg-white/80 shadow-sm">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-[#8e726d]">Visibles en tienda</p>
                <p className="mt-1 text-2xl font-semibold text-[#6f4b46]">
                  {stats.active}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5e7e2] p-3 text-[#a56e64]">
                <Eye className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#ecd8d2] bg-white/80 shadow-sm">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-[#8e726d]">Ocultos</p>
                <p className="mt-1 text-2xl font-semibold text-[#6f4b46]">
                  {stats.inactive}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5e7e2] p-3 text-[#a56e64]">
                <Archive className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#ecd8d2] bg-white/80 shadow-sm">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-[#8e726d]">Destacados</p>
                <p className="mt-1 text-2xl font-semibold text-[#6f4b46]">
                  {stats.featured}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5e7e2] p-3 text-[#a56e64]">
                <Sparkles className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#ecd8d2] bg-white/85 shadow-sm">
          <CardContent className="flex flex-col gap-3 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#a78680]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, código, marca o enlace"
                className="border-[#e8d4ce] bg-[#fffaf9] pl-9 text-[#6f4b46] placeholder:text-[#b19792]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-[#9a716a]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-10 rounded-md border border-[#e8d4ce] bg-[#fffaf9] px-3 text-sm text-[#6f4b46] outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="active">Solo visibles</option>
                  <option value="inactive">Solo ocultos</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-[#9a716a]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 rounded-md border border-[#e8d4ce] bg-[#fffaf9] px-3 text-sm text-[#6f4b46] outline-none"
                >
                  <option value="recent">Más recientes</option>
                  <option value="name-asc">Nombre A - Z</option>
                  <option value="name-desc">Nombre Z - A</option>
                  <option value="price-asc">Precio menor a mayor</option>
                  <option value="price-desc">Precio mayor a menor</option>
                  <option value="stock-desc">Más stock</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-h-[92vh] overflow-y-auto border-[#ead6d0] bg-[#fffaf8] sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#6f4b46]">
                {editingId ? "Editar producto" : "Crear producto"}
              </DialogTitle>
              <DialogDescription className="text-[#8d726d]">
                Completa la información del producto de forma clara y ordenada.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6">
                <Card className="border-[#ecd8d2] bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#6f4b46]">
                      Información principal
                    </CardTitle>
                    <CardDescription className="text-[#8d726d]">
                      Datos básicos para identificar el producto dentro de tu
                      tienda.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="codigo" className="text-[#6f4b46]">
                        Código del producto
                      </Label>
                      <Input
                        id="codigo"
                        placeholder="Ej: AUR-001"
                        value={form.codigo}
                        onChange={(e) =>
                          setForm({ ...form, codigo: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                      <p className="text-xs text-[#a0857f]">
                        Código interno para identificarlo fácilmente.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marca" className="text-[#6f4b46]">
                        Marca
                      </Label>
                      <Input
                        id="marca"
                        placeholder="Auren"
                        value={form.marca}
                        onChange={(e) =>
                          setForm({ ...form, marca: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nombre" className="text-[#6f4b46]">
                        Nombre del producto
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Bolso nude elegante"
                        value={form.nombre}
                        onChange={(e) =>
                          setForm((prev) => {
                            const nextName = e.target.value;
                            return {
                              ...prev,
                              nombre: nextName,
                              enlace:
                                editingId || prev.enlace.trim()
                                  ? prev.enlace
                                  : slugify(nextName),
                            };
                          })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enlace" className="text-[#6f4b46]">
                          Nombre para la URL
                        </Label>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              enlace: slugify(prev.nombre),
                            }))
                          }
                          className="text-xs font-medium text-[#b17b73] underline underline-offset-4"
                        >
                          Generar automáticamente
                        </button>
                      </div>
                      <Input
                        id="enlace"
                        placeholder="Ej: bolso-nude-elegante"
                        value={form.enlace}
                        onChange={(e) =>
                          setForm({ ...form, enlace: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                      <p className="text-xs text-[#a0857f]">
                        Este texto se usa en el enlace del producto.
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="descripcionCorta"
                        className="text-[#6f4b46]"
                      >
                        Descripción corta
                      </Label>
                      <Input
                        id="descripcionCorta"
                        placeholder="Texto breve para mostrar en listados"
                        value={form.descripcionCorta}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            descripcionCorta: e.target.value,
                          })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descripcion" className="text-[#6f4b46]">
                        Descripción detallada
                      </Label>
                      <Textarea
                        id="descripcion"
                        rows={5}
                        placeholder="Describe el producto, materiales, estilo, uso, beneficios..."
                        value={form.descripcion}
                        onChange={(e) =>
                          setForm({ ...form, descripcion: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#ecd8d2] bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#6f4b46]">
                      Precio e inventario
                    </CardTitle>
                    <CardDescription className="text-[#8d726d]">
                      Configura valores y disponibilidad del producto.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="precio" className="text-[#6f4b46]">
                        Precio de venta
                      </Label>
                      <Input
                        id="precio"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.precio}
                        onChange={(e) =>
                          setForm({ ...form, precio: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="precioAnterior"
                        className="text-[#6f4b46]"
                      >
                        Precio anterior
                      </Label>
                      <Input
                        id="precioAnterior"
                        type="number"
                        min="0"
                        placeholder="Opcional"
                        value={form.precioAnterior}
                        onChange={(e) =>
                          setForm({ ...form, precioAnterior: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                      <p className="text-xs text-[#a0857f]">
                        Úsalo si quieres mostrar descuento.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-[#6f4b46]">
                        Stock disponible
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.stock}
                        onChange={(e) =>
                          setForm({ ...form, stock: e.target.value })
                        }
                        className="border-[#e8d4ce] bg-[#fffaf9]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-[#ecd8d2] bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#6f4b46]">
                      Visibilidad
                    </CardTitle>
                    <CardDescription className="text-[#8d726d]">
                      Decide cómo se mostrará el producto en la tienda.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-[#edd8d2] bg-[#fff8f6] p-4">
                      <div>
                        <p className="font-medium text-[#6f4b46]">
                          Visible en tienda
                        </p>
                        <p className="text-sm text-[#8d726d]">
                          Si está activo, el producto se muestra al público.
                        </p>
                      </div>
                      <Switch
                        checked={form.visible}
                        onCheckedChange={(checked) =>
                          setForm({ ...form, visible: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-[#edd8d2] bg-[#fff8f6] p-4">
                      <div>
                        <p className="font-medium text-[#6f4b46]">
                          Producto destacado
                        </p>
                        <p className="text-sm text-[#8d726d]">
                          Resáltalo para promociones o secciones especiales.
                        </p>
                      </div>
                      <Switch
                        checked={form.destacado}
                        onCheckedChange={(checked) =>
                          setForm({ ...form, destacado: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#ecd8d2] bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#6f4b46]">
                      Imagen del producto
                    </CardTitle>
                    <CardDescription className="text-[#8d726d]">
                      Puedes arrastrar una imagen o seleccionarla manualmente.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        handleSelectedFile(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`group flex min-h-72 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition ${isDragging
                        ? "border-[#c78f85] bg-[#f8e8e4]"
                        : "border-[#e5cfc8] bg-[#fcf5f3] hover:border-[#d6aba3] hover:bg-[#fbefeb]"
                        }`}
                    >
                      {imagePreview ? (
                        <div className="relative h-72 w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt={form.nombre || "Vista previa"}
                            className="h-72 w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-4 text-white opacity-0 transition group-hover:opacity-100">
                            <p className="text-sm font-medium">
                              Cambiar imagen
                            </p>
                            <p className="text-xs text-white/90">
                              Arrastra otra imagen o haz clic aquí
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 px-6 text-center text-[#a0857f]">
                          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                            <UploadCloud className="size-8" />
                          </div>
                          <div>
                            <p className="font-medium text-[#7d5e59]">
                              Arrastra tu imagen aquí
                            </p>
                            <p className="mt-1 text-sm">
                              o haz clic para seleccionarla desde tu equipo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSelectedFile(e.target.files?.[0])}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-[#dcc2bb] bg-white text-[#6f4b46] hover:bg-[#faf1ee]"
                    >
                      <ImagePlus className="size-4" />
                      Seleccionar imagen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-[#ecd8d2] bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#6f4b46]">
                      Vista previa
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="overflow-hidden rounded-[1.75rem] border border-[#ecd8d2] bg-[#fffaf8] shadow-sm">
                      <div className="relative h-52 w-full bg-[#f7ece8]">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreview}
                            alt={form.nombre || "Vista previa del producto"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#b19690]">
                            <ImageIcon className="size-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-[#6f4b46]">
                              {form.nombre || "Nombre del producto"}
                            </p>
                            <p className="text-sm text-[#927671]">
                              {form.marca || "Auren"} ·{" "}
                              {form.codigo || "Código"}
                            </p>
                          </div>

                          <Badge className="bg-[#eecdc6] text-[#744f48] hover:bg-[#eecdc6]">
                            {form.visible ? "Visible" : "Oculto"}
                          </Badge>
                        </div>

                        <p className="line-clamp-2 text-sm text-[#8d726d]">
                          {form.descripcionCorta ||
                            "Aquí aparecerá una breve descripción del producto."}
                        </p>

                        <div className="flex items-end justify-between gap-3 pt-1">
                          <div>
                            <p className="text-lg font-semibold text-[#6f4b46]">
                              {formatCurrency(Number(form.precio || 0))}
                            </p>
                            {form.precioAnterior ? (
                              <p className="text-sm text-[#ab8d88] line-through">
                                {formatCurrency(Number(form.precioAnterior || 0))}
                              </p>
                            ) : null}
                          </div>

                          <p className="text-sm text-[#8d726d]">
                            {Number(form.stock || 0)} unidades
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#ddc4bc] bg-white text-[#6f4b46] hover:bg-[#faf1ee]"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveProduct}
                disabled={isSaving}
                className="bg-[#b9877d] text-white hover:bg-[#a8746b]"
              >
                {isSaving
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Crear producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent className="border-[#ead6d0] bg-[#fffaf8] sm:max-w-md">
            <DialogHeader>
              <div className="mb-2 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f8e4e1]">
                  <TriangleAlert className="size-7 text-[#c27b73]" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl text-[#6f4b46]">
                Confirmar eliminación
              </DialogTitle>
              <DialogDescription className="text-center text-[#8d726d]">
                {deleteTarget ? (
                  <>
                    Vas a eliminar <b>{deleteTarget.name}</b>. Esta acción no se
                    puede deshacer.
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-2 gap-2 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="border-[#ddc4bc] bg-white text-[#6f4b46] hover:bg-[#faf1ee]"
              >
                Cancelar
              </Button>
              <Button
                onClick={deleteProduct}
                disabled={isProcessingId === deleteTarget?.id}
                className="bg-[#d08f86] text-white hover:bg-[#bd7a72]"
              >
                {isProcessingId === deleteTarget?.id
                  ? "Eliminando..."
                  : "Sí, eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {filteredProducts.length === 0 ? (
            <Card className="border-[#ecd8d2] bg-white/85 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                <Package className="size-8 text-[#b08b84]" />
                <div>
                  <p className="font-medium text-[#6f4b46]">
                    No hay productos para mostrar
                  </p>
                  <p className="text-sm text-[#8d726d]">
                    Ajusta los filtros o crea un nuevo producto.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden border-[#ecd8d2] bg-white/85 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="grid gap-0 md:grid-cols-[150px_1fr_auto]">
                    <div className="flex items-center justify-center border-b border-[#f0dfda] bg-[#fcf5f3] p-4 md:border-r md:border-b-0">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-28 w-28 rounded-3xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-[#ecd8d2] bg-white text-xs text-[#a0857f]">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#6f4b46]">
                              {product.name}
                            </h3>

                            <Badge
                              className={
                                product.active
                                  ? "bg-[#e8c7c1] text-[#734f48] hover:bg-[#e8c7c1]"
                                  : "bg-[#eee7e5] text-[#7c6a66] hover:bg-[#eee7e5]"
                              }
                            >
                              {product.active ? "Visible" : "Oculto"}
                            </Badge>

                            {product.featured && (
                              <Badge className="bg-[#f2ddd3] text-[#8a5c53] hover:bg-[#f2ddd3]">
                                Destacado
                              </Badge>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[#927671]">
                            {product.brand} · {product.sku}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-xl font-semibold text-[#6f4b46]">
                            {formatCurrency(product.price)}
                          </p>
                          {product.compareAtPrice ? (
                            <p className="text-sm text-[#ab8d88] line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm md:grid-cols-3">
                        <div>
                          <p className="font-medium text-[#6f4b46]">
                            Nombre para URL
                          </p>
                          <p className="truncate text-[#8d726d]">
                            {product.slug}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-[#6f4b46]">
                            Stock disponible
                          </p>
                          <p className="text-[#8d726d]">
                            {product.quantityAvailable} unidades
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-[#6f4b46]">
                            Descripción corta
                          </p>
                          <p className="line-clamp-2 text-[#8d726d]">
                            {product.shortDescription || "Sin descripción corta"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-[#f0dfda] p-4 md:border-t-0 md:border-l">
                      <Button
                        variant="outline"
                        onClick={() => openEdit(product)}
                        disabled={isProcessingId === product.id}
                        className="border-[#dcc2bb] bg-white text-[#6f4b46] hover:bg-[#faf1ee]"
                      >
                        <Pencil className="size-4" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => toggleActive(product.id)}
                        disabled={isProcessingId === product.id}
                        className="border-[#dcc2bb] bg-white text-[#6f4b46] hover:bg-[#faf1ee]"
                      >
                        {product.active ? (
                          <>
                            <EyeOff className="size-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="size-4" />
                            Mostrar
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => setDeleteTarget(product)}
                        disabled={isProcessingId === product.id}
                        className="bg-[#d08f86] text-white hover:bg-[#bd7a72]"
                      >
                        <Trash2 className="size-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}