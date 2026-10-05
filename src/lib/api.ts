export interface Product {
  id: number;
  name_ar: string;
  team: string;
  year: number;
  era: string;
  price: number;
  old_price?: number | null;
  image: string;
  sizes: string;
  condition: string;
  rarity: string;
  stock: number;
  rating: number;
  reviews_count: number;
  description_ar: string;
  category: string;
  featured: boolean;
  badge?: string | null;
  brand?: string | null;
}

export interface CartItem {
  product: Product;
  size: string;
  qty: number;
}

export interface Review {
  id: number;
  product_id: number;
  author: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface OrderLine {
  product_id: number;
  name: string;
  size: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  items: OrderLine[];
  total: number;
  status: string;
  created_at: string;
}

export function parseSizes(s: string): string[] {
  if (!s) return ['M', 'L', 'XL'];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

export function formatPrice(n: number): string {
  return `${Number(n).toLocaleString('en-US')} دج`;
}
