import { AdminPanel } from "@/components/admin/admin-panel";
import { getCatalogProducts } from "@/lib/products";

export default async function AdminPage() {
  try {
    const products = await getCatalogProducts();
    return <AdminPanel initialProducts={products} />;
  } catch (err) {
    console.error("Error cargando AdminPage:", err);

    return (
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center bg-[#f8f1ef] px-4">
        <div className="rounded-3xl border border-[#ead7d1] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-[#6f4b46]">
            Error al cargar el panel
          </h1>
          <p className="mt-2 text-sm text-[#8d726d]">
            No fue posible cargar el catálogo de productos.
          </p>
        </div>
      </div>
    );
  }
}