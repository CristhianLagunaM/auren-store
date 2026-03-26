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
  productType?: string;
  imageUrl?: string;
}

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
  productType?: string;
  imageFileBase64?: string;
  imageFileName?: string;
  imageUrl?: string;
}

export interface ProductUpdateBody extends ProductCreateBody {
  id: number;
}