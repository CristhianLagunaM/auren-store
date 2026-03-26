import { AdminPanel } from "@/components/admin/admin-panel";
import { getCatalogProducts } from "@/lib/products";

export default async function AdminPage() {
  try {
    // Trae los productos desde Prisma con relaciones
    const products = await getCatalogProducts();

    return <AdminPanel initialProducts={products} />;
  } catch (err) {
    console.error("Error cargando AdminPage:", err);
    return <div>Error al cargar el catálogo de productos</div>;
  }
}