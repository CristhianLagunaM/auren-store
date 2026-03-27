export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getStoreProducts } from "@/lib/store-products";
import { StoreHeader } from "@/components/store/store-header";
import { HeroSection } from "@/components/store/hero-section";
import { StoreFront } from "@/components/store/store-front";

export default async function HomePage() {
  const products = await getStoreProducts();

  return (
    <main className="min-h-screen bg-[#f8f1ef]">
      <StoreHeader />
      <HeroSection total={products.length} />
      <StoreFront products={products} />
    </main>
  );
}