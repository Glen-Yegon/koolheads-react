export interface CapeProduct {
  id: string;
  name: string;
  category: "cape";
  images: string[];
  sizes: string[];
  description: string;
  price?: number;
  type: "curved brim" | "flat brim";
}

export interface AccessoryProduct {
  id: string;
  name: string;
  category: "accessory";
  images: string[];
  sizes: string[];
  description: string;
  price?: number;
  // ❌ no "type" allowed
}

export type Product = CapeProduct | AccessoryProduct;
