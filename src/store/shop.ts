import { createContext, useContext } from 'react';
import type { Product } from '../lib/api';

export const CART_KEY = 'zaman-cart';
export const WISH_KEY = 'zaman-wish';

export interface CartItemLine {
  id: number;
  size: string;
  qty: number;
}

export interface CartState {
  cart: import('../lib/api').CartItem[];
  cartOpen: boolean;
  cartCount: number;
  subtotal: number;
}

export interface ShopActions {
  setCartOpen: (v: boolean) => void;
  addToCart: (p: Product, size: string, qty?: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQty: (productId: number, size: string, qty: number) => void;
  clearCart: () => void;
  toggleWish: (id: number) => void;
  showToast: (msg: string) => void;
}

/**
 * The state is split across four contexts rather than one, so an unrelated
 * update does not re-render every `ProductCard` in the grid. `ShopActions` is
 * fully stable (all `useCallback`, memoised value) and therefore safe to read
 * from memoised children.
 */
export const ActionsCtx = createContext<ShopActions | null>(null);
export const CartCtx = createContext<CartState | null>(null);
export const WishlistCtx = createContext<number[] | null>(null);
export const ToastCtx = createContext<string | null>(null);

function required<T>(v: T | null, name: string): T {
  if (v === null) throw new Error(`${name} must be used inside <ShopProvider>`);
  return v;
}

/** Stable action creators — reading this never causes a re-render. */
export function useShopActions(): ShopActions {
  return required(useContext(ActionsCtx), 'useShopActions');
}

export function useCart(): CartState {
  return required(useContext(CartCtx), 'useCart');
}

export function useWishlist(): number[] {
  return required(useContext(WishlistCtx), 'useWishlist');
}

export function useToast(): string | null {
  return required(useContext(ToastCtx), 'useToast');
}

/** Everything at once. Prefer the narrow hooks above in hot components. */
export function useShop(): ShopActions & CartState & { wishlist: number[]; toast: string | null } {
  return {
    ...required(useContext(ActionsCtx), 'useShop'),
    ...required(useContext(CartCtx), 'useCart'),
    wishlist: required(useContext(WishlistCtx), 'useWishlist'),
    toast: required(useContext(ToastCtx), 'useToast'),
  };
}