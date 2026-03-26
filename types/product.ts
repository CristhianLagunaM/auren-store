// types/product.ts

export interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  quantityAvailable: number;
  active: boolean;
  featured: boolean;
  imageUrl?: string;
}

// Para crear producto (POST)
export interface ProductCreateBody {
  sku: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  quantityAvailable: number;
  active: boolean;
  featured: boolean;
  imageFileBase64?: string;
  imageFileName?: string;
  imageUrl?: string;
}

// Para actualizar producto (PUT)
export interface ProductUpdateBody extends ProductCreateBody {
  id: number;
}